import React, { useState } from 'react'
import { Button } from 'react-native'
import RNDatePicker from 'react-native-date-picker'

const DatePicker = ({
    activator,
    onChange,
    selectedDate,
}) => {
  const [date, setDate] = useState(selectedDate || new Date())
  const [open, setOpen] = useState(false)

  return (
    <>
      {activator && activator({ openPicker: () => setOpen(true), selectedDate: date })}
      <RNDatePicker
        modal
        open={open}
        date={date}
        mode='date'
        onConfirm={(date) => {
          setOpen(false)
          setDate(date)
          onChange(date)
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />
    </>
  )
}

export default DatePicker;