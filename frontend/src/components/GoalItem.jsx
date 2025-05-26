import { useDispatch, useSelector } from 'react-redux'
import { IoIosDownload } from "react-icons/io";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { deleteGoal } from '../features/goals/goalSlice'
import { getCommentsByGoal, createComment, deleteComment } from '../features/comments/commentSlice'
import { toggleLike, checkLike, getLikesCount } from '../features/likes/likeSlice'
import { useState, useEffect, useRef } from 'react'

function GoalItem({ goal }) {
  const { user } = useSelector((state) => state.auth)
  const { comments = {} } = useSelector((state) => state.comments || {})
  const { likes = {} } = useSelector((state) => state.likes || {})
  const dispatch = useDispatch()
  
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [previewImageError, setPreviewImageError] = useState(false)
  const [likeAnimating, setLikeAnimating] = useState(false)
  
  // Local state for like data that syncs with Redux
  const [likeStatus, setLikeStatus] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  
  // Use refs to keep track of latest like data for debugging
  const likeStatusRef = useRef(likeStatus)
  const likeCountRef = useRef(likeCount)
  
  const DEFAULT_IMAGE = 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg';

  // Parse file metadata if available
  const fileMetadata = goal.fileMetadata ? JSON.parse(goal.fileMetadata) : null;
  const fileType = goal.fileType || '';
  const fileName = fileMetadata?.name || '';
  const fileExtension = fileName.split('.').pop().toLowerCase();
  
  // Improved file type detection
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const is3DModel = fileType === 'model/gltf-binary' || fileType.includes('glb') || 
                   (fileMetadata?.name && fileMetadata.name.toLowerCase().endsWith('.glb'));
  const isOtherFile = !isImage && !isVideo && !isAudio && !is3DModel && goal.imgURL;

  const isOwner = user && goal.user === user._id

  // Obtainment of author

  
  // Load comments when the goal is opened
  useEffect(() => {
    if (isOpen && (!comments[goal._id] || !showComments)) {
      dispatch(getCommentsByGoal(goal._id))
      setShowComments(true)
    }
  }, [isOpen, dispatch, goal._id, comments, showComments])
  
  // Load likes data for this goal
  useEffect(() => {
    // First, get the like count for all users
    dispatch(getLikesCount(goal._id))
      .then((result) => {
        if (result.payload) {
          console.log(`[GoalItem] Got like count from API:`, result.payload);
          // Update the local like count
          setLikeCount(result.payload.likeCount || 0);
          likeCountRef.current = result.payload.likeCount || 0;
        }
      })
    
    // If user is logged in, check if they've liked this goal
    if (user) {
      dispatch(checkLike(goal._id))
        .then((result) => {
          if (result.payload) {
            // Update the local like status
            setLikeStatus(result.payload.liked || false);
            likeStatusRef.current = result.payload.liked || false;
          }
        })
    }
  }, [dispatch, goal._id, user])

  const openGoal = () => setIsOpen(true)
  const closeGoal = () => setIsOpen(false)

  const downloadFile = () => {
    if (!goal.imgURL) {
      console.error('No file to download');
      return;
    }
    
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

  const handleImageError = () => {
    console.log('Main image failed to load');
    setImageError(true);
  }

  const handlePreviewImageError = () => {
    console.log('Preview image failed to load');
    setPreviewImageError(true);
  }
  
  // Handle toggling the like state
  const handleLikeToggle = (e) => {
    e.stopPropagation(); // Prevent opening the goal modal
    
    if (!user) {
      // If user is not logged in, prompt them to log in
      alert('Please log in to like posts');
      return;
    }
    
    // Animate the heart immediately for better UX
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);
    
    // Optimistically update UI for immediate feedback
    const newLikeStatus = !likeStatus;
    setLikeStatus(newLikeStatus);
    setLikeCount(prevCount => newLikeStatus ? prevCount + 1 : Math.max(0, prevCount - 1));
    
    // Then toggle the like in the database
    dispatch(toggleLike(goal._id))
      .then((result) => {
        if (result.payload) {
          // Update with the actual values from the server
          setLikeStatus(result.payload.liked);
          setLikeCount(result.payload.likeCount);
          
          // Update refs for debugging
          likeStatusRef.current = result.payload.liked;
          likeCountRef.current = result.payload.likeCount;
        }
      })
      .catch((error) => {
        console.error('[GoalItem] Error toggling like:', error);
        // Revert optimistic update on error
        setLikeStatus(!newLikeStatus);
        setLikeCount(prevCount => !newLikeStatus ? prevCount + 1 : Math.max(0, prevCount - 1));
      });
  }

  // Improved preview image validation
  const hasValidPreviewImage = () => {
    return goal.imgURLpreview && 
           typeof goal.imgURLpreview === 'string' && 
           (goal.imgURLpreview.startsWith('data:') || goal.imgURLpreview.startsWith('http'));
  }

  // Function to render proper preview in card view
  const renderFilePreview = () => {
    // For any file type, first try to use the preview image if available
    if (hasValidPreviewImage()) {
      return (
        <img 
          src={previewImageError ? DEFAULT_IMAGE : goal.imgURLpreview} 
          alt="File preview" 
          className="goal-image" 
          onError={handlePreviewImageError}
        />
      );
    }
    
    // For images, display the image directly
    if (isImage) {
      return (
        <img 
          src={imageError ? DEFAULT_IMAGE : goal.imgURL} 
          alt="Goal" 
          className="goal-image" 
          onError={handleImageError}
        />
      );
    } 
    
    // For videos, display a video element
    else if (isVideo) {
      return (
        <div className="video-preview-container">
          <video className="goal-video-thumbnail" controls>
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    } 
    
    // For audio, display an audio element
    else if (isAudio) {
      return (
        <div className="audio-preview-container">
          <audio controls className="goal-audio">
            <source src={goal.imgURL} type={fileType} />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }
    
    // For all other files (including .java), show generic file icon
    else if (isOtherFile) {
      return (
        <div className="file-preview-container">
          <div className="file-icon">
            {fileExtension ? fileExtension.toUpperCase() : 'FILE'}
          </div>
          <div className="file-name">{fileName || "Unknown File"}</div>
        </div>
      );
    }
    
    return null;
  };

  // Function to render detailed file view in popup
  const renderDetailedFileView = () => {
    // For all non-media files, show file info with preview if available
    if (isOtherFile || is3DModel) {
      return (
        <div className="file-container">
          {/* Show preview image above the file info if available */}
          {hasValidPreviewImage() && (
            <div className="file-preview-image">
              <img 
                src={previewImageError ? DEFAULT_IMAGE : goal.imgURLpreview}
                alt="File preview" 
                className="goal-popup-preview-image" 
                style={{ maxWidth: '100%', marginBottom: '15px' }}
                onError={handlePreviewImageError}
              />
            </div>
          )}
          <div className="file-info">
            <p className="file-name">{fileMetadata?.name || `File.${fileExtension || ''}`}</p>
            <p className="file-size">{fileMetadata?.size ? `${Math.round(fileMetadata.size / 1024)} KB` : ''}</p>
            <p className="file-type">{fileExtension ? fileExtension.toUpperCase() + ' File' : 'File'}</p>
          </div>
        </div>
      );
    }
    
    if (isImage) {
      return (
        <img 
          src={imageError ? DEFAULT_IMAGE : goal.imgURL} 
          alt="Goal" 
          className="goal-popup-image" 
          onError={handleImageError}
        />
      );
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
    }
    return null;
  };

  return (
    <>
      
      <div className='goal' onClick={openGoal}>
        <h2>{goal.text}</h2>

        {goal.imgURL && renderFilePreview()}
        
        <div className="goal-footer">
            <div className="file-info-tags">
                <span>   Category:  </span>
                {goal.category && (
                  <span className="category-tag">{goal.category}</span>
                )}
                <span className="separator"> - </span>
                {fileExtension && (
                  <span className="file-type-tag">{fileExtension.toUpperCase()}</span>
                )}
            </div>

          <button 
            onClick={handleLikeToggle} 
            className={`like-button-small ${likeStatus ? 'liked' : ''}`}
          >
            {likeStatus ? <IoMdHeart className="heart-icon-small" /> : <IoMdHeartEmpty className="heart-icon-small" />}
            <span className="like-count-small">{likeCount}</span>
          </button>
        </div>

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
                <p>{goal.description}</p>
              </div>
              
              {/* Buttons - Combined in a single container */}
              <div className="button-container">
                {goal.imgURL && (
                  <button onClick={downloadFile} className="download-button">
                    <IoIosDownload />&nbsp;Download {fileExtension ? fileExtension.toUpperCase() : 'File'}
                  </button>
                )}
                
                <button 
                  onClick={handleLikeToggle} 
                  className={`like-button ${likeStatus ? 'liked' : ''} ${likeAnimating ? 'animate' : ''}`}
                >
                  {likeStatus ? <IoMdHeart className="heart-icon" /> : <IoMdHeartEmpty className="heart-icon" />}
                  <span className="like-count">{likeCount}</span>
                </button>
              </div>
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