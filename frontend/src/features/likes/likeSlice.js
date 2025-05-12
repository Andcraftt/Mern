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
      // Handle case when user is not logged in
      const state = thunkAPI.getState();
      if (!state.auth.user) {
        return thunkAPI.rejectWithValue('User not logged in');
      }
      
      const token = state.auth.user.token;
      return await likeService.toggleLike(goalId, token);
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
      // Handle case when user is not logged in
      const state = thunkAPI.getState();
      if (!state.auth.user) {
        return { goalId, liked: false, likeCount: 0 };
      }
      
      const token = state.auth.user.token;
      return await likeService.checkLike(goalId, token);
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
      return await likeService.getLikesCount(goalId);
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
  'likes/multipleCounts',
  async (goalIds, thunkAPI) => {
    try {
      return await likeService.getMultipleLikesCounts(goalIds);
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
        
        const { goalId, liked, likeCount } = action.payload;
        
        // Update the like state for this goal
        state.likes[goalId] = {
          userLiked: liked,
          count: likeCount
        };
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
        
        const { goalId, liked, likeCount } = action.payload;
        
        // Store user's like status for this goal
        state.likes[goalId] = {
          userLiked: liked,
          count: likeCount
        };
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
        
        const { goalId, likeCount } = action.payload;
        
        // Store or update like count for this goal
        if (!state.likes[goalId]) {
          state.likes[goalId] = {
            userLiked: state.likes[goalId]?.userLiked || false,
            count: likeCount
          };
        } else {
          state.likes[goalId].count = likeCount;
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
        
        // Process multiple like counts
        action.payload.forEach(item => {
          const { goalId, likeCount } = item;
          
          if (!state.likes[goalId]) {
            state.likes[goalId] = {
              userLiked: state.likes[goalId]?.userLiked || false,
              count: likeCount
            };
          } else {
            state.likes[goalId].count = likeCount;
          }
        });
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