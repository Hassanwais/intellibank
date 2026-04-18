import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountService from '../services/accountService';

const initialState = {
  accounts: [],
  accountDetails: null,
  statement: null,
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await accountService.getAccounts();
    return data.accounts;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const fetchAccountDetails = createAsyncThunk('accounts/fetchDetails', async (accountId, thunkAPI) => {
  try {
    return await accountService.getAccountDetails(accountId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const fetchAccountStatement = createAsyncThunk('accounts/fetchStatement', async ({ accountId, params }, thunkAPI) => {
  try {
    return await accountService.getAccountStatement(accountId, params);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccountDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accountDetails = action.payload;
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccountStatement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAccountStatement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statement = action.payload;
      })
      .addCase(fetchAccountStatement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;
