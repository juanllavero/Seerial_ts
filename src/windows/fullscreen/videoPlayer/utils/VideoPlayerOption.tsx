import React from 'react'

function VideoPlayerOption({
   text,
   value,
   values,
   onChange,
   isSlider = false,
}: {
   text: string
   value: number
   values?: string[]
   onChange: () => void
   isSlider?: boolean
}) {
  return (
   <div className="option">
      <span>{text}</span>
      {isSlider ? (
         <input
            type="range"
            min={-100}
            max={100}
            step={.1}
            value={value}
            onChange={onChange}
         />
      ) : (
         <select value={value} onChange={onChange}>
            {values && values.map((v) => (
               <option key={v} value={v}>
                  {v}%
               </option>
            ))}
         </select>
      )}
   </div>
  )
}

export default React.memo(VideoPlayerOption)