import { HalfStarIcon } from '../icons/halfStar';
import { StarIcon } from '../icons/star';

export default function Rating({ num }: { num: number | undefined }) {
  if (num === undefined || num < 0) return null;
  
  const numArr = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${num} out of 5 stars`}>
      {numArr.map((number) => {
        // Full Star Condition
        if (number <= num) {
          return (
            <StarIcon 
              key={number} 
              className="w-5 h-5 text-amber-500 fill-amber-500" 
            />
          );
        } 
        // Half Star Condition
        else if (number - 0.5 === num) {
          return (
            <HalfStarIcon 
              key={number} 
              className="w-5 h-5 text-amber-500 fill-amber-500" 
            />
          );
        } 
        // Empty Star Condition (Fixed class and added key)
        else {
          return (
            <StarIcon 
              key={number} 
              className="w-5 h-5 text-neutral-300 fill-neutral-200" 
            />
          );
        }
      })}
    </div>
  );
}