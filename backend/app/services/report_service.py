"""
Report Service Module
Handles generation of all system reports.
"""

import io
import csv
import json
from datetime import datetime, timedelta
from decimal import Decimal
from flask import current_app
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
import pandas as pd

from app import db
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert

class ReportService:
    """Service for generating all system reports."""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = self.styles['Title']
        self.heading_style = self.styles['Heading2']
        self.normal_style = self.styles['Normal']

    def generate_monthly_statement(self, user_id, account_id, year, month, format='pdf'):
        """
        Generate monthly account statement.
        
        Args:
            user_id: Customer ID
            account_id: Account ID
            year: Statement year
            month: Statement month
            format: 'pdf' or 'csv'
            
        Returns:
            bytes: File content
        """
        # Get account and user information
        account = Account.query.get(account_id)
        user = User.query.get(user_id)
        
        # Define date range
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)
        
        # Get transactions for the period
        from app.models.transaction import Transaction
        transactions = Transaction.query.filter(
            (Transaction.from_account_id == account_id) |
            (Transaction.to_account_id == account_id),
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date + timedelta(days=1),
            Transaction.status == 'Success'
        ).order_by(Transaction.created_at).all()
        
        # Calculate opening balance
        opening_balance = self._get_balance_as_of(account_id, start_date - timedelta(days=1))
        
        # Process transaction data
        transaction_data = []
        running_balance = opening_balance
        
        for tx in transactions:
            amount = float(tx.amount)
            if tx.to_account_id == account_id:
                running_balance += amount
                transaction_data.append({
                    'date': tx.created_at.strftime('%m/%d/%Y'),
                    'description': tx.description or tx.transaction_type,
                    'debit': None,
                    'credit': amount,
                    'balance': float(running_balance)
                })
            else:
                running_balance -= amount
                transaction_data.append({
                    'date': tx.created_at.strftime('%m/%d/%Y'),
                    'description': tx.description or tx.transaction_type,
                    'debit': amount,
                    'credit': None,
                    'balance': float(running_balance)
                })
        
        # Calculate totals
        total_deposits = sum(t['credit'] or 0 for t in transaction_data)
        total_withdrawals = sum(t['debit'] or 0 for t in transaction_data)
        
        if format == 'csv':
            return self._generate_statement_csv(account, user, transaction_data, start_date, end_date, opening_balance, running_balance, total_deposits, total_withdrawals)
        else:
            return self._generate_statement_pdf(account, user, transaction_data, start_date, end_date, opening_balance, running_balance, total_deposits, total_withdrawals)

    def _generate_statement_pdf(self, account, user, transactions, start_date, end_date, opening_balance, closing_balance, total_deposits, total_withdrawals):
        """Generate PDF statement."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Header
        elements.append(Paragraph("Intelligent Online Banking", self.title_style))
        elements.append(Paragraph("Monthly Account Statement", self.heading_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Account Information
        account_info = [
            f"Account Holder: {user.full_name}",
            f"Account Number: {account.account_number}",
            f"Account Type: {account.account_type}",
            f"Statement Period: {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}",
            f"Opening Balance: NGN {opening_balance:,.2f}",
            f"Closing Balance: NGN {closing_balance:,.2f}"
        ]
        
        for info in account_info:
            elements.append(Paragraph(info, self.normal_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Transactions Table
        if transactions:
            data = [['Date', 'Description', 'Debit', 'Credit', 'Balance']]
            for tx in transactions:
                data.append([
                    tx['date'],
                    tx['description'],
                    f"NGN {tx['debit']:,.2f}" if tx['debit'] else '',
                    f"NGN {tx['credit']:,.2f}" if tx['credit'] else '',
                    f"NGN {tx['balance']:,.2f}"
                ])
            
            # Add totals row
            data.append(['', 'TOTALS', f"NGN {total_withdrawals:,.2f}", f"NGN {total_deposits:,.2f}", ''])
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
        else:
            elements.append(Paragraph("No transactions for this period.", self.normal_style))
        
        # Footer
        elements.append(Spacer(1, 0.5 * inch))
        elements.append(Paragraph("This is a system-generated statement. For queries, contact support.", self.normal_style))
        elements.append(Paragraph(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

    def _generate_statement_csv(self, account, user, transactions, start_date, end_date, opening_balance, closing_balance, total_deposits, total_withdrawals):
        """Generate CSV statement."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['INTELLIGENT ONLINE BANKING - MONTHLY STATEMENT'])
        writer.writerow([f'Account Holder: {user.full_name}'])
        writer.writerow([f'Account Number: {account.account_number}'])
        writer.writerow([f'Statement Period: {start_date.strftime("%Y-%m-%d")} to {end_date.strftime("%Y-%m-%d")}'])
        writer.writerow([f'Opening Balance: NGN {opening_balance:,.2f}'])
        writer.writerow([f'Closing Balance: NGN {closing_balance:,.2f}'])
        writer.writerow([])
        writer.writerow(['Date', 'Description', 'Debit (NGN)', 'Credit (NGN)', 'Balance (NGN)'])
        
        for tx in transactions:
            writer.writerow([
                tx['date'],
                tx['description'],
                f"{tx['debit']:,.2f}" if tx['debit'] else '',
                f"{tx['credit']:,.2f}" if tx['credit'] else '',
                f"{tx['balance']:,.2f}"
            ])
        
        writer.writerow([])
        writer.writerow(['TOTAL WITHDRAWALS', '', f"{total_withdrawals:,.2f}", '', ''])
        writer.writerow(['TOTAL DEPOSITS', '', '', f"{total_deposits:,.2f}", ''])
        writer.writerow([f'Generated on: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}'])
        
        output.seek(0)
        return io.BytesIO(output.getvalue().encode('utf-8'))

    def generate_fraud_summary(self, start_date, end_date, format='pdf'):
        """Generate fraud detection summary report."""
        # Get fraud alerts
        alerts = FraudAlert.query.filter(
            FraudAlert.created_at >= start_date,
            FraudAlert.created_at <= end_date
        ).all()
        
        # Calculate statistics
        total_alerts = len(alerts)
        confirmed = sum(1 for a in alerts if a.status == 'Confirmed')
        false_positives = sum(1 for a in alerts if a.status == 'False Positive')
        pending = sum(1 for a in alerts if a.status == 'Pending')
        
        # Calculate prevented losses
        prevented_losses = sum(
            float(a.transaction.amount) for a in alerts 
            if a.status == 'Confirmed' and a.transaction
        )
        
        # Group by severity
        severity_counts = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        for alert in alerts:
            severity_counts[alert.alert_severity] += 1
        
        if format == 'csv':
            return self._generate_fraud_csv(alerts, start_date, end_date, total_alerts, confirmed, false_positives, pending, prevented_losses, severity_counts)
        else:
            return self._generate_fraud_pdf(alerts, start_date, end_date, total_alerts, confirmed, false_positives, pending, prevented_losses, severity_counts)

    def _generate_fraud_pdf(self, alerts, start_date, end_date, total_alerts, confirmed, false_positives, pending, prevented_losses, severity_counts):
        """Generate PDF fraud summary."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Header
        elements.append(Paragraph("Intelligent Online Banking", self.title_style))
        elements.append(Paragraph("Fraud Detection Summary Report", self.heading_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Report Information
        report_info = [
            f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Total Alerts: {total_alerts}",
            f"Confirmed Fraud: {confirmed}",
            f"False Positives: {false_positives}",
            f"Pending Review: {pending}",
            f"Prevented Losses: NGN {prevented_losses:,.2f}"
        ]
        
        for info in report_info:
            elements.append(Paragraph(info, self.normal_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Severity Distribution
        elements.append(Paragraph("Alerts by Severity", self.heading_style))
        severity_data = [['Severity', 'Count', 'Percentage']]
        for severity, count in severity_counts.items():
            percentage = (count / total_alerts * 100) if total_alerts > 0 else 0
            severity_data.append([severity, str(count), f"{percentage:.1f}%"])
        
        table = Table(severity_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

    def _get_balance_as_of(self, account_id, as_of_date):
        """Calculate account balance as of a specific date."""
        # Get current balance
        account = Account.query.get(account_id)
        if not account:
            return 0
            
        current_balance = account.balance
        
        # Subtract all successful transactions after as_of_date
        # (reverse the transactions to go back in time)
        from app.models.transaction import Transaction
        future_transactions = Transaction.query.filter(
            Transaction.created_at > as_of_date,
            Transaction.status == 'Success',
            (Transaction.from_account_id == account_id) | (Transaction.to_account_id == account_id)
        ).all()
        
        balance = float(current_balance)
        for tx in future_transactions:
            if tx.to_account_id == account_id:
                # This was a credit, so in the past the balance was lower
                balance -= float(tx.amount)
            if tx.from_account_id == account_id:
                # This was a debit, so in the past the balance was higher
                balance += float(tx.amount)
                
        return balance