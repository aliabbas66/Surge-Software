import React from 'react'

export const Marketing = () => {
    const [from, setFrom] = React.useState('ahoj')
    const [to, setTo] = React.useState('nazdar')
  
  
    const handleClick = () => {
      const helper = from;
      setFrom(to);
      setTo(helper);
    }
  
  
  
    return (
      <div>
        <input value={from} />
        <input value={to} />
  
        <button onClick={handleClick}> Switch</button>
      </div>
    )
}
