import React from 'react'
import CountdownCard from './CountdownCard'

const CountdownDetails = ({ item, onDelete, onIncrement, onDecrement }) => {
  return (
    <CountdownCard
      item={item}
      mode="expanded"
      onDelete={onDelete}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
    />
  )
}

export default CountdownDetails


