// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem('auth')) || { user: null, token: null };
  } catch (e) {
    return { user: null, token: null };
  }
})();

const initialState = {
  user: saved.user,
  token: saved.token,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('auth', JSON.stringify({ user, token }));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth');
    },
    setLoading(state, action) {
      state.loading = !!action.payload;
    }
  }
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
