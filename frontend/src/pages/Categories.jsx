import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { IoIosSettings } from "react-icons/io";
import GoalForm from '../components/GoalForm'
import GoalItem from '../components/GoalItem'
import Spinner from '../components/Spinner'
import { getGoals, reset } from '../features/goals/goalSlice'
import { Link } from 'react-router-dom'

function Categories() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedCategory, setSelectedCategory] = useState(null) // Track category selection

  const { goals, isLoading, isError, message } = useSelector((state) => state.goals)

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    dispatch(getGoals())

    return () => {
      dispatch(reset())
    }
  }, [dispatch, isError, message])

  if (isLoading) {
    return <Spinner />
  }

  const categories = ['Videgames', 'Art', 'Food', 'Code', 'Health', 'Web Designs'] 

  // Filter goals based on the selected category
  const filteredGoals = selectedCategory
    ? goals.filter(goal => goal.category === selectedCategory)
    : []

  return (
    <>
      <div className='ajustBack'>
        <section className='heading'>
          <h1>Categories</h1>
        </section>

        {/* Category Buttons - Only show if no category is selected */}
        {!selectedCategory && (
          <section className='category-filters'>
            {categories.map((category) => (
              <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className='category-button'
            >
              {category}
            </button>
            ))}
          </section>
        )}

        {/* Displaying Goals - Only show after a category is selected */}
        {selectedCategory && (
          <section className='content'>
            {filteredGoals.length > 0 ? (
              <div className='goals'>
                {filteredGoals.map((goal) => (
                  <GoalItem key={goal._id} goal={goal} />
                ))}
              </div>
            ) : (
              <h3>No goals in this category</h3>
            )}
          </section>
        )}

        {/* Go back button to reset category */}
        {selectedCategory && (
          <button onClick={() => setSelectedCategory(null)} className='back-button'>
            Back to Categories
          </button>
        )}
      </div>
    </>
  )
}

export default Categories
