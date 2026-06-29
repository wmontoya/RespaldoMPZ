"use client"

import type React from "react"
import { useState } from "react"

import { Card, CardBody, CardFooter } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isWithinInterval,
} from "date-fns"
import { es } from "date-fns/locale"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"

interface DateRangePickerProps {
    initialRange: {
        from: Date | undefined
        to: Date | undefined
    }
    onRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
    onCancel: () => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ initialRange, onRangeChange, onCancel }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedRange, setSelectedRange] = useState<{
        from: Date | undefined
        to: Date | undefined
    }>(initialRange)

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }

    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }

    const handleDateClick = (day: Date) => {
        if (!selectedRange.from) {
            setSelectedRange({ from: day, to: undefined })
        } else if (!selectedRange.to && day >= selectedRange.from) {
            setSelectedRange({ ...selectedRange, to: day })
        } else {
            setSelectedRange({ from: day, to: undefined })
        }
    }

    const isDateInRange = (day: Date) => {
        if (selectedRange.from && selectedRange.to) {
            return isWithinInterval(day, { start: selectedRange.from, end: selectedRange.to })
        }
        return false
    }

    const renderDays = (monthToRender: Date) => {
        const monthStart = startOfMonth(monthToRender)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart, { locale: es })
        const endDate = endOfWeek(monthEnd, { locale: es })

        const rows = []
        let days = []
        let day = startDate

        // Header row with day names
        const dayNames = []
        for (let i = 0; i < 7; i++) {
            dayNames.push(
                <div
                    key={`header-${i}`}
                    className="w-10 h-10 flex items-center justify-center text-xs text-gray-500 font-medium"
                >
                    {format(addDays(startDate, i), "EEEEE", { locale: es }).toUpperCase()}
                </div>,
            )
        }
        rows.push(
            <div key="header" className="grid grid-cols-7 mb-1">
                {dayNames}
            </div>,
        )

        // Date cells
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day
                const isToday = isSameDay(day, new Date())
                const isSelected =
                    (selectedRange.from && isSameDay(day, selectedRange.from)) ||
                    (selectedRange.to && isSameDay(day, selectedRange.to))
                const isInRange = isDateInRange(day)
                const isCurrentMonth = isSameMonth(day, monthToRender)

                days.push(
                    <div
                        key={day.toString()}
                        className={`w-10 h-10 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors
              ${!isCurrentMonth ? "text-gray-300" : ""}
              ${isToday ? "border border-orange-500" : ""}
              ${isSelected ? "bg-orange-500 text-white" : ""}
              ${isInRange && !isSelected ? "bg-orange-100" : ""}
              ${isCurrentMonth && !isSelected && !isInRange ? "hover:bg-gray-100" : ""}
            `}
                        onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
                    >
                        {format(day, "d")}
                    </div>,
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-0">
                    {days}
                </div>,
            )
            days = []
        }

        return rows
    }

    const handleApply = () => {
        onRangeChange(selectedRange)
    }

    const handleClear = () => {
        setSelectedRange({ from: undefined, to: undefined })
    }

    return (
        <Card className="w-auto">
            <CardBody className="p-4">
                <div className="flex gap-4">
                    {/* First month */}
                    <div className="min-w-[280px]">
                        <div className="flex justify-between items-center mb-4">
                            <Button isIconOnly variant="light" onPress={prevMonth} className="text-gray-500">
                                <BiChevronLeft size={20} />
                            </Button>
                            <div className="font-medium">{format(currentDate, "MMMM yyyy", { locale: es })}</div>
                            <div className="w-9"></div> {/* Spacer to balance the layout */}
                        </div>
                        <div className="space-y-2">{renderDays(currentDate)}</div>
                    </div>

                    {/* Second month */}
                    <div className="min-w-[280px]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-9"></div> {/* Spacer to balance the layout */}
                            <div className="font-medium">{format(addMonths(currentDate, 1), "MMMM yyyy", { locale: es })}</div>
                            <Button isIconOnly variant="light" onPress={nextMonth} className="text-gray-500">
                                <BiChevronRight size={20} />
                            </Button>
                        </div>
                        <div className="space-y-2">{renderDays(addMonths(currentDate, 1))}</div>
                    </div>
                </div>
            </CardBody>
            <CardFooter className="flex justify-between border-t border-gray-200 p-3">
                <Button variant="light" onPress={handleClear} className="text-gray-500">
                    Limpiar
                </Button>
                <div className="flex gap-2">
                    <Button variant="light" onPress={onCancel}>
                        Cancelar
                    </Button>
                    <Button variant="light" onPress={handleApply}>
                        Aplicar
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default DateRangePicker

