import { useDispatch, useSelector } from 'react-redux'
import { IoIosDownload } from "react-icons/io";
import { deleteGoal } from '../features/goals/goalSlice'
import { getCommentsByGoal, createComment, deleteComment } from '../features/comments/commentSlice'
import { useState, useEffect } from 'react'

function GoalItem({ goal }) {
  const { user } = useSelector((state) => state.auth)
  const { comments } = useSelector((state) => state.comments)
  const dispatch = useDispatch()
  
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  const isOwner = user && goal.user === user._id

  // Load comments when the goal is opened
  useEffect(() => {
    if (isOpen && (!comments[goal._id] || !showComments)) {
      dispatch(getCommentsByGoal(goal._id))
      setShowComments(true)
    }
  }, [isOpen, dispatch, goal._id, comments, showComments])

  const openGoal = () => setIsOpen(true)
  const closeGoal = () => setIsOpen(false)

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = goal.imgURL
    link.download = 'goal-image'
    link.click()
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    
    if (newComment.trim()) {
      dispatch(createComment({
        text: newComment,
        goalId: goal._id
      }))
      setNewComment('')
    }
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(commentId))
    }
  }

  return (
    <>
      <div className='goal' onClick={openGoal}>
        <h2>{goal.text}</h2>

        {goal.imgURL && <img src={goal.imgURL} alt="Goal" className="goal-image" />}

        {isOwner && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              dispatch(deleteGoal(goal._id))
            }} 
            className="close"
          >
            X
          </button>
        )}
      </div>

      {isOpen && (
        <div className="goalInner">
        <div className="goal-inner-content">
          <div className="popup-header">
            <h2>{goal.text}</h2>
            <button onClick={closeGoal} className="close-popup">×</button>
          </div>
          
          {/* Columna izquierda (contenido principal) */}
          <div className="popup-left-column">
            {goal.imgURL && (
              <div className="popup-image-container">
                <img src={goal.imgURL} alt="Goal" className="goal-popup-image" />
              </div>
            )}
            
            <div className="popup-description">
              <p>{goal.description}</p>
            </div>
      
            {goal.imgURL && (
              <div className="download-button-container">
                <button onClick={downloadImage} className="download-button">
                  <IoIosDownload />
                </button>
              </div>
            )}
          </div>
          
          {/* Columna derecha (comentarios) */}
          <div className="popup-right-column">
            <div className="comments-section">
              <h3>Comments</h3>
              
              {/* Formulario de comentarios */}
              {user && (
                <form onSubmit={handleSubmitComment} className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="comment-input"
                  />
                  <button type="submit" className="comment-submit">
                    Post
                  </button>
                </form>
              )}
              
              {/* Lista de comentarios */}
              <div className="comments-list">
                {comments[goal._id] && comments[goal._id].length > 0 ? (
                  comments[goal._id].map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.user.name}</strong>
                        <p>&nbsp</p>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      
                      {/* Botón de eliminar para el dueño del comentario */}
                      {user && user._id === comment.user._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="delete-comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  )
}

export default GoalItem