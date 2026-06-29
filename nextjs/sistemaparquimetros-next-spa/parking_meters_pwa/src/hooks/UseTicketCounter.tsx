import { useEffect, useState } from "react";
import useParkingMetersStore from "@/store/useParkingMeters.store";
import { calculateEndTime, getTimeRemaining } from "@/utils/converter";

export const useTicketCounter = (startDate: Date) => {
  const { setParkingTime, parkingRateList } = useParkingMetersStore();
  const [rateIds, setRateIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const countOccurrences = (rateIds: number[], newId: number) =>
    rateIds.filter(rateId => rateId === newId).length;

  const calculateTotals = (ids: number[]) => {
    return ids.reduce(
      (acc, id) => {
        const rate = parkingRateList.find(item => item.id === id);
        if (rate) {
          acc.totalHours += rate.hours;
          acc.totalPrice += rate.price;
        }
        return acc;
      },
      { totalHours: 0, totalPrice: 0 }
    );
  };

  useEffect(() => {
    const { totalPrice } = calculateTotals(rateIds);
    const currentParkingTime = useParkingMetersStore.getState().parkingTime;
    if (currentParkingTime.amount !== totalPrice) {
      setParkingTime({
        ...currentParkingTime,
        amount: totalPrice
      });
    }
  }, [rateIds]);

  const increment = (newId: number) => {
    const updatedRateIds = [...rateIds, newId];
    const { totalHours } = calculateTotals(updatedRateIds);
    const remainingHours = getTimeRemaining();

    setRateIds(updatedRateIds);
    setParkingTime({
      parkingRateId: updatedRateIds,
      endTime: calculateEndTime(totalHours, startDate)
    });

    if (totalHours > remainingHours) {
      setIsModalOpen(true);
    }
  };

  const decrement = (idToRemove: number) => {
    const index = rateIds.indexOf(idToRemove);
    if (index === -1) return;

    const updatedRateIds = [
      ...rateIds.slice(0, index),
      ...rateIds.slice(index + 1)
    ];

    const { totalHours } = calculateTotals(updatedRateIds);
    const remainingHours = getTimeRemaining();

    setRateIds(updatedRateIds);
    setParkingTime({
      parkingRateId: updatedRateIds,
      endTime: calculateEndTime(totalHours, startDate)
    });

    if (totalHours <= remainingHours) {
      setIsModalOpen(false);
    }
  };

  const getTotalPrice = () => calculateTotals(rateIds).totalPrice;

  return {
    rateIds,
    parkingRateList,
    isModalOpen,
    countOccurrences,
    getTotalPrice,
    increment,
    decrement,
  };
};
