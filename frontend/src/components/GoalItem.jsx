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

  // Parse file metadata if available
  const fileMetadata = goal.fileMetadata ? JSON.parse(goal.fileMetadata) : null;
  const fileType = goal.fileType || '';
  
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isOtherFile = !isImage && !isVideo && !isAudio && goal.imgURL;

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

  const downloadFile = () => {
    const link = document.createElement('a')
    link.href = goal.imgURL
    link.download = fileMetadata ? fileMetadata.name : 'download'
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

  // Function to render proper preview in card view
  const renderFilePreview = () => {
    if (isImage) {
      return <img src={goal.imgURL} alt="Goal" className="goal-image" />;
    } else if (isVideo) {
      return (
        <div className="video-preview-container">
          <video className="goal-video-thumbnail" controls>
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else if (isAudio) {
      return (
        <div className="audio-preview-container">
          <audio controls className="goal-audio">
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    } else if (isOtherFile) {
      // Use the preview image if available, otherwise show file icon
      if (goal.imgURLpreview) {
        return <img src={goal.imgURLpreview} alt="File preview" className="goal-image" />;
      } else {
        return (
          <div className="file-preview-container">
            <div className="file-icon">
              {fileMetadata?.name?.split('.').pop().toUpperCase() || 'FILE'}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Function to render detailed file view in popup
  const renderDetailedFileView = () => {
    if (isImage) {
      return <img src={goal.imgURL} alt="Goal" className="goal-popup-image" />;
    } else if (isVideo) {
      return (
        <div className="video-container">
          <video className="goal-popup-video" controls>
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else if (isAudio) {
      return (
        <div className="audio-container">
          <audio className="goal-popup-audio" controls>
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support audio playback.
          </audio>
          <div className="audio-visualization">
            {/* Audio waveform placeholder or visualization could go here */}
            <div className="audio-placeholder"></div>
          </div>
        </div>
      );
    } else if (isOtherFile) {
      return (
        <div className="file-container">
          {/* Show preview image above the file info if available */}
          {goal.imgURLpreview && (
            <div className="file-preview-image">
              <img 
                src={goal.imgURLpreview} 
                alt="File preview" 
                className="goal-popup-preview-image" 
                style={{ maxWidth: '100%', marginBottom: '15px' }}
              />
            </div>
          )}
          <div className="file-icon-large">
            {fileMetadata?.name?.split('.').pop().toUpperCase() || 'FILE'}
          </div>
          <div className="file-info">
            <p className="file-name">{fileMetadata?.name || 'File'}</p>
            <p className="file-size">{fileMetadata?.size ? `${Math.round(fileMetadata.size / 1024)} KB` : ''}</p>
            <p className="file-type">{fileType || 'Unknown type'}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className='goal' onClick={openGoal}>
        <h2>{goal.text}</h2>

        {goal.imgURL && renderFilePreview()}

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
            
            {/* Left column (main content) with scrollable description */}
            <div className="popup-left-column">
              {goal.imgURL && (
                <div className="popup-file-container">
                  {renderDetailedFileView()}
                </div>
              )}
              
              {/* Scrollable description container */}
              <div className="popup-description-container">
                <div className="popup-description">
                  <p>{goal.description}</p>
                </div>
              </div>
              
              {/* Fixed download button at bottom */}
              {goal.imgURL && (
                <div className="download-button-container">
                  <button onClick={downloadFile} className="download-button">
                    <IoIosDownload />&nbsp;Download {fileMetadata?.name ? fileMetadata.name.split('.').pop().toUpperCase() : 'File'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Right column (comments) - independently scrollable */}
            <div className="popup-right-column">
              <div className="comments-section">
                <h3>Comments</h3>
                
                {/* Comments form */}
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
                
                {/* Comments list */}
                <div className="comments-list">
                  {comments[goal._id] && comments[goal._id].length > 0 ? (
                    comments[goal._id].map((comment) => (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-header">
                          <strong>{comment.user.name}</strong>
                          <p>&nbsp;</p>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                        
                        {/* Delete button for comment owner */}
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