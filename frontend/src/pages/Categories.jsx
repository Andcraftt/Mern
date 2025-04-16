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

  const [selectedCategory, setSelectedCategory] = useState('All')

  const { user } = useSelector((state) => state.auth)
  const { goals, isLoading, isError, message } = useSelector(
    (state) => state.goals
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    if (!user) {
      navigate('/login')
    } else {
      dispatch(getGoals())
    }

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, isError, message, dispatch])

  if (isLoading) {
    return <Spinner />
  }

  const userGoals = goals.filter((goal) => goal.user === user._id)

  const filteredGoals = selectedCategory === 'All'
    ? userGoals
    : userGoals.filter(goal => goal.category === selectedCategory)

  const categories = ['All', 'Fitness', 'Study', 'Work', 'Personal', 'Health']

  return (
    <>
      <div className='ajustBack'>
        <section className='heading'>
          <Link to='/settings' className='ajustButton'>
            <IoIosSettings />
          </Link>
          <h1>Welcome {user && user.name}</h1>
          <p>CREATE A NEW POST</p>
        </section>

        {user && <GoalForm />}
      </div>

      <section className='category-filters'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </section>

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
    </>
  )
}

export default Categories
