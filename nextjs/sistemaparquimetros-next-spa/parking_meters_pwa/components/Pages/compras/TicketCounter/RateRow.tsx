import { FaMinus, FaPlus } from "react-icons/fa";

interface RateRowProps {
  item: { id: number; hours: number; minutes: number; price: number };
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

 const RateRow = ({ item, count, onIncrement, onDecrement }: RateRowProps) => (
  <tr className="border-b dark:bg-gray-800 dark:border-gray-700">
    <td className="px-6 py-4 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      {item.hours < 1 && <span>{item.minutes} minutos</span>}
      {item.hours === 1 && <span>{item.hours} hora</span>}
      {item.hours > 1 && <span>{item.hours} horas</span>}
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center w-full">
        <button
          onClick={onDecrement}
          className="inline-flex items-center justify-center p-1 me-3 text-sm h-8 w-8 flex-shrink-0 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          type="button"
        >
          <FaMinus />
        </button>
        <div className="flex-grow">
          <input
            value={count}
            type="text"
            disabled
            className="text-center bg-gray-50 w-full min-w-[3rem] border border-gray-300 text-gray-900 text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0"
          />
        </div>
        <button
          onClick={onIncrement}
          className="inline-flex items-center justify-center h-8 w-8 p-1 ms-3 text-sm flex-shrink-0 text-gray-500 bg-white border border-gray-300 rounded-full"
          type="button"
        >
          <FaPlus />
        </button>
      </div>
    </td>
  </tr>
);

export default RateRow;
