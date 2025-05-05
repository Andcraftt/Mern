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
      return await likeService.getLikesCount(goalId)
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

// Get likes counts for multiple goals
export const getMultipleLikesCounts = createAsyncThunk(
  'likes/counts',
  async (goalIds, thunkAPI) => {
    try {
      return await likeService.getMultipleLikesCounts(goalIds)
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
        
        // Update the user's liked status for this goal
        if (!state.likes[action.payload.goalId]) {
          state.likes[action.payload.goalId] = {
            userLiked: action.payload.liked,
            count: action.payload.liked ? 1 : 0
          }
        } else {
          // Update liked status
          state.likes[action.payload.goalId].userLiked = action.payload.liked
          
          // Update count
          if (action.payload.liked) {
            state.likes[action.payload.goalId].count++
          } else {
            state.likes[action.payload.goalId].count--
          }
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
        
        // Store user's like status for this goal
        if (!state.likes[action.payload.goalId]) {
          state.likes[action.payload.goalId] = {
            userLiked: action.payload.liked,
            count: 0
          }
        } else {
          state.likes[action.payload.goalId].userLiked = action.payload.liked
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
        
        // Store like count for this goal
        if (!state.likes[action.payload.goalId]) {
          state.likes[action.payload.goalId] = {
            userLiked: false,
            count: action.payload.count
          }
        } else {
          state.likes[action.payload.goalId].count = action.payload.count
        }
      })
      .addCase(getLikesCount.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getMultipleLikesCounts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMultipleLikesCounts.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        
        // Update like counts for multiple goals
        const counts = action.payload
        
        Object.keys(counts).forEach(goalId => {
          if (!state.likes[goalId]) {
            state.likes[goalId] = {
              userLiked: false,
              count: counts[goalId]
            }
          } else {
            state.likes[goalId].count = counts[goalId]
          }
        })
      })
      .addCase(getMultipleLikesCounts.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = likeSlice.actions
export default likeSlice.reducer