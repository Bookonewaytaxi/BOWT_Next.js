import React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext({})

const RadioGroup = React.forwardRef(({ className, value, defaultValue, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const finalValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue) => {
    setInternalValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <RadioGroupContext.Provider value={{ value: finalValue, onValueChange: handleValueChange }}>
      <div role="radiogroup" className={cn("grid gap-2", className)} {...props} ref={ref} />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value: itemValue, id, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(RadioGroupContext)
  const isChecked = value === itemValue

  return (
    <input
      type="radio"
      ref={ref}
      id={id}
      value={itemValue}
      checked={isChecked}
      onChange={() => onValueChange(itemValue)}
      data-state={isChecked ? "checked" : "unchecked"}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }