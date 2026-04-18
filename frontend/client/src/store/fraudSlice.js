import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fraudService from '../services/fraudService';

const initialState = {
  alerts: [],
  stats: null,
  isLoading: false,
  error: null,
  analysisResult: null
};

export const fetchFraudAlerts = createAsyncThunk('fraud/fetchAlerts', async (_, thunkAPI) => {
  try {
    return await fraudService.getFraudAlerts();
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const fetchFraudStats = createAsyncThunk('fraud/fetchStats', async (_, thunkAPI) => {
  try {
    return await fraudService.getFraudStats();
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const analyzeTransaction = createAsyncThunk('fraud/analyze', async ({ transactionId, locationData }, thunkAPI) => {
  try {
    return await fraudService.analyzeTransaction(transactionId, locationData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const updateAlertStatus = createAsyncThunk('fraud/updateStatus', async ({ alertId, status, notes }, thunkAPI) => {
  try {
    const response = await fraudService.updateAlertStatus(alertId, status, notes);
    return { alertId, status, response };
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const fraudSlice = createSlice({
  name: 'fraud',
  initialState,
  reducers: {
    clearFraudError: (state) => { state.error = null; },
    clearAnalysisResult: (state) => { state.analysisResult = null; }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Alerts
      .addCase(fetchFraudAlerts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFraudAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = action.payload.alerts || [];
      })
      .addCase(fetchFraudAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Stats
      .addCase(fetchFraudStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFraudStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchFraudStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Analyze Transaction
      .addCase(analyzeTransaction.pending, (state) => { state.isLoading = true; })
      .addCase(analyzeTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analysisResult = action.payload;
      })
      .addCase(analyzeTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Alert
      .addCase(updateAlertStatus.fulfilled, (state, action) => {
        const { alertId, status } = action.payload;
        const alert = state.alerts.find(a => a.fraud_id === alertId);
        if (alert) {
          alert.status = status;
        }
      });
  },
});

export const { clearFraudError, clearAnalysisResult } = fraudSlice.actions;
export default fraudSlice.reducer;
