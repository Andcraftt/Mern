import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import commentService from './commentService'

const initialState = {
  comments: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Get comments for a specific goal
export const getCommentsByGoal = createAsyncThunk(
  'comments/getByGoal',
  async (goalId, thunkAPI) => {
    try {
      return await commentService.getCommentsByGoal(goalId)
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

// Create new comment
export const createComment = createAsyncThunk(
  'comments/create',
  async (commentData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await commentService.createComment(commentData, token)
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

// Delete comment
export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await commentService.deleteComment(commentId, token)
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

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCommentsByGoal.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCommentsByGoal.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Store comments by goal ID for easy access
        state.comments[action.meta.arg] = action.payload
      })
      .addCase(getCommentsByGoal.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createComment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Add the new comment to the appropriate goal's comment array
        const goalId = action.payload.goal
        if (state.comments[goalId]) {
          state.comments[goalId].push(action.payload)
        } else {
          state.comments[goalId] = [action.payload]
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Remove the deleted comment from all goal comment arrays
        Object.keys(state.comments).forEach(goalId => {
          state.comments[goalId] = state.comments[goalId].filter(
            comment => comment._id !== action.payload.id
          )
        })
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = commentSlice.actions
export default commentSlice.reducer