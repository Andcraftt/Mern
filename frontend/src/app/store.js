import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import goalReducer from '../features/goals/goalSlice'
import commentReducer from '../features/comments/commentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalReducer,
    comments: commentReducer,
  },
})