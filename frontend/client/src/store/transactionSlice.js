import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../services/transactionService';

const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
  transferSuccess: false
};

export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await transactionService.getTransactions();
    return data.transactions;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const processTransfer = createAsyncThunk('transactions/transfer', async (transferData, thunkAPI) => {
  try {
    return await transactionService.transfer(transferData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => { state.error = null; },
    resetTransferSuccess: (state) => { state.transferSuccess = false; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(processTransfer.pending, (state) => {
        state.isLoading = true;
        state.transferSuccess = false;
      })
      .addCase(processTransfer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transferSuccess = true;
        // Prepend new transaction to state to prevent re-fetching necessarily
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(processTransfer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.transferSuccess = false;
      });
  },
});

export const { clearTransactionError, resetTransferSuccess } = transactionSlice.actions;
export default transactionSlice.reducer;
