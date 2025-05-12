import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import likeService from './likeService'

const initialState = {
  likes: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Toggle like on a goal
export const toggleLike = createAsyncThunk(
  'likes/toggle',
  async (goalId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await likeService.toggleLike(goalId, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Check if a user has liked a goal
export const checkLike = createAsyncThunk(
  'likes/check',
  async (goalId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await likeService.checkLike(goalId, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get likes count for a goal
export const getLikesCount = createAsyncThunk(
  'likes/count',
  async (goalId, thunkAPI) => {
    try {
      const response = await likeService.getLikesCount(goalId)
      return { goalId, likeCount: response.likeCount }
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleLike.pending, (state) => {
        state.isLoading = true
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        
        const goalId = action.payload.goalId || action.meta.arg
        
        // Update the user's liked status for this goal
        if (!state.likes[goalId]) {
          state.likes[goalId] = {
            userLiked: action.payload.liked,
            count: action.payload.likeCount
          }
        } else {
          // Update liked status and count
          state.likes[goalId].userLiked = action.payload.liked
          state.likes[goalId].count = action.payload.likeCount
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(checkLike.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkLike.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        
        const goalId = action.meta.arg
        
        // Store user's like status for this goal
        if (!state.likes[goalId]) {
          state.likes[goalId] = {
            userLiked: action.payload.liked,
            count: action.payload.likeCount
          }
        } else {
          state.likes[goalId].userLiked = action.payload.liked
          state.likes[goalId].count = action.payload.likeCount
        }
      })
      .addCase(checkLike.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getLikesCount.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getLikesCount.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        
        const { goalId, likeCount } = action.payload
        
        // Store or update like count for this goal
        if (!state.likes[goalId]) {
          state.likes[goalId] = {
            userLiked: false,
            count: likeCount
          }
        } else {
          state.likes[goalId].count = likeCount
        }
      })
      .addCase(getLikesCount.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = likeSlice.actions
export default likeSlice.reducer