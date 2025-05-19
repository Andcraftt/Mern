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
      console.log(`[likeSlice] Toggling like for goal ${goalId}`)
      const response = await likeService.toggleLike(goalId, token)
      console.log(`[likeSlice] Toggle response:`, response)
      // Return both the response data and the goalId
      return { ...response, goalId }
    } catch (error) {
      console.error(`[likeSlice] Toggle like error:`, error)
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
      // Only proceed if user is logged in
      const user = thunkAPI.getState().auth.user
      if (!user) {
        console.log(`[likeSlice] No user logged in, skipping checkLike for ${goalId}`)
        return { liked: false, likeCount: 0, goalId }
      }
      
      console.log(`[likeSlice] Checking like status for goal ${goalId}`)
      const token = user.token
      const response = await likeService.checkLike(goalId, token)
      console.log(`[likeSlice] Check response:`, response)
      // Return both the response data and the goalId
      return { ...response, goalId }
    } catch (error) {
      console.error(`[likeSlice] Check like error:`, error)
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
      console.log(`[likeSlice] Getting like count for goal ${goalId}`)
      const response = await likeService.getLikesCount(goalId)
      console.log(`[likeSlice] Count response:`, response)
      // Return both the response data and the goalId
      return { ...response, goalId }
    } catch (error) {
      console.error(`[likeSlice] Get like count error:`, error)
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
      console.log(`[likeSlice] Getting like counts for multiple goals:`, goalIds)
      const response = await likeService.getMultipleLikesCounts(goalIds)
      console.log(`[likeSlice] Multiple counts response:`, response)
      return response
    } catch (error) {
      console.error(`[likeSlice] Get multiple like counts error:`, error)
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
        state.likes[action.payload.goalId] = {
          userLiked: action.payload.liked,
          count: action.payload.likeCount
        }
        console.log(`[likeSlice] Updated likes state after toggle:`, state.likes)
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
        state.likes[action.payload.goalId] = {
          userLiked: action.payload.liked,
          count: action.payload.likeCount
        }
        console.log(`[likeSlice] Updated likes state after check:`, state.likes)
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
        const currentLikes = state.likes[action.payload.goalId] || {}
        state.likes[action.payload.goalId] = {
          ...currentLikes,
          count: action.payload.likeCount,
          // If userLiked doesn't exist yet, default to false
          userLiked: currentLikes.userLiked || false
        }
        console.log(`[likeSlice] Updated likes state after count:`, state.likes)
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
        action.payload.forEach(item => {
          const currentLikes = state.likes[item.goalId] || {}
          state.likes[item.goalId] = {
            ...currentLikes,
            count: item.likeCount,
            // If userLiked doesn't exist yet, default to false
            userLiked: currentLikes.userLiked || false
          }
        })
        console.log(`[likeSlice] Updated likes state after multiple counts:`, state.likes)
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