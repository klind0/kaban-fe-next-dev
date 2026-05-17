import { useCallback } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";

export function useFormScrollToError() {
  const onInvalidSubmit = useCallback((errors: FieldErrors<FieldValues>) => {
    // React Hook Form orders the errors object properties by registration layout order.
    // We grab the first error key to find the topmost invalid input field.
    const errorKeys = Object.keys(errors);
    
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      
      // Attempt to look up the element by its 'name' attribute
      let element = document.getElementsByName(firstErrorKey)[0];
      
      // If nested fields (like price.amount) break the direct selector, 
      // fall back to a modern query selector matching the string path
      if (!element) {
        element = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement;
      }

      if (element) {
        // Smoothly scroll the container or parent card into view
        element.scrollIntoView({
          behavior: "smooth",
          block: "center", // 'center' avoids getting blocked by floating nav headers
        });
        
        // Optionally put accessibility focus into the element
        element.focus({ preventScroll: true });
      }
    }
  }, []);

  return onInvalidSubmit;
}