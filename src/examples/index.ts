export interface ArrayState {
    id: string;
    values: number[];
    highlights: number[]; // indices of highlighted elements
    swapping: number[]; // indices of elements currently swapping
}

export type ActionType =
    | 'create_variable'
    | 'update_variable'
    | 'array_create'
    | 'array_insert'
    | 'array_swap'
    | 'loop_iteration'
    | 'function_call'
    | 'function_return';

export interface ExecutionStep {
    lineIndex: number; // 1-indexed, for Monaco
    variables: Record<string, any>;
    arrays?: ArrayState[];
    callStack?: string[];
    explanation: string; // the AI Tutor text
    action?: ActionType;
    actionData?: any; // Additional data for specific actions (e.g. { name: 'arr', index: 0, swapWith: 1 })
    inputRequired?: boolean; // Whether this step pauses for user input
    terminalOutput?: string; // New output added in this step
}

export interface Example {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
    steps: ExecutionStep[];
}

// Generating a deterministic run of Bubble Sort for [4, 2, 7, 1]
const bubbleSortSteps: ExecutionStep[] = [
    { lineIndex: 1, variables: {}, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [], swapping: [] }], explanation: "We start by defining the bubble_sort function." },
    { lineIndex: 9, variables: {}, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [], swapping: [] }], explanation: "We declare an array of numbers to sort: [4, 2, 7, 1]." },
    { lineIndex: 10, variables: {}, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [], swapping: [] }], explanation: "We call the bubble_sort function and pass in our array.", callStack: ["main()", "bubble_sort([4, 2, 7, 1])"] },
    { lineIndex: 2, variables: { n: 4 }, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [], swapping: [] }], explanation: "Inside the function, we find the length of the array, which is 4.", callStack: ["main()", "bubble_sort()"] },

    // Outer loop i=0
    { lineIndex: 3, variables: { n: 4, i: 0 }, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [], swapping: [] }], explanation: "Start the outer loop. 'i' tracks how many elements are already fully sorted at the end.", callStack: ["main()", "bubble_sort()"] },

    // j=0 (4 vs 2)
    { lineIndex: 4, variables: { n: 4, i: 0, j: 0 }, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [0, 1], swapping: [] }], explanation: "Inner loop starts at 'j = 0'. We compare the first two elements: 4 and 2." },
    { lineIndex: 5, variables: { n: 4, i: 0, j: 0 }, arrays: [{ id: "arr", values: [4, 2, 7, 1], highlights: [0, 1], swapping: [] }], explanation: "Is 4 greater than 2? Yes! So we need to swap them." },
    { lineIndex: 6, variables: { n: 4, i: 0, j: 0 }, arrays: [{ id: "arr", values: [2, 4, 7, 1], highlights: [], swapping: [0, 1] }], explanation: "Swapping 4 and 2. 4 moves to the right because it's heavier." },

    // j=1 (4 vs 7)
    { lineIndex: 4, variables: { n: 4, i: 0, j: 1 }, arrays: [{ id: "arr", values: [2, 4, 7, 1], highlights: [1, 2], swapping: [] }], explanation: "Move to the next pair 'j=1'. Compare 4 and 7." },
    { lineIndex: 5, variables: { n: 4, i: 0, j: 1 }, arrays: [{ id: "arr", values: [2, 4, 7, 1], highlights: [1, 2], swapping: [] }], explanation: "Is 4 greater than 7? No. They are in the correct order, so we do nothing." },

    // j=2 (7 vs 1)
    { lineIndex: 4, variables: { n: 4, i: 0, j: 2 }, arrays: [{ id: "arr", values: [2, 4, 7, 1], highlights: [2, 3], swapping: [] }], explanation: "Move to the next pair 'j=2'. Compare 7 and 1." },
    { lineIndex: 5, variables: { n: 4, i: 0, j: 2 }, arrays: [{ id: "arr", values: [2, 4, 7, 1], highlights: [2, 3], swapping: [] }], explanation: "Is 7 greater than 1? Yes! We must swap." },
    { lineIndex: 6, variables: { n: 4, i: 0, j: 2 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [], swapping: [2, 3] }], explanation: "Swapped! 7 has 'bubbled' up to the very end of the array." },

    // End of i=0
    { lineIndex: 3, variables: { n: 4, i: 1 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [3], swapping: [] }], explanation: "First pass is complete! The largest number (7) is now locked in place at the end. Increment 'i' to 1." },

    // Outer loop i=1, Inner j=0 (2 vs 4)
    { lineIndex: 4, variables: { n: 4, i: 1, j: 0 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [0, 1], swapping: [] }], explanation: "Second pass begins. Compare 2 and 4." },
    { lineIndex: 5, variables: { n: 4, i: 1, j: 0 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [0, 1], swapping: [] }], explanation: "2 is not greater than 4. No swap needed." },

    // j=1 (4 vs 1)
    { lineIndex: 4, variables: { n: 4, i: 1, j: 1 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [1, 2], swapping: [] }], explanation: "Next pair. Compare 4 and 1." },
    { lineIndex: 5, variables: { n: 4, i: 1, j: 1 }, arrays: [{ id: "arr", values: [2, 4, 1, 7], highlights: [1, 2], swapping: [] }], explanation: "4 is greater than 1. Time to swap!" },
    { lineIndex: 6, variables: { n: 4, i: 1, j: 1 }, arrays: [{ id: "arr", values: [2, 1, 4, 7], highlights: [], swapping: [1, 2] }], explanation: "Swapped! 4 moves upwards." },

    // End of i=1
    { lineIndex: 3, variables: { n: 4, i: 2 }, arrays: [{ id: "arr", values: [2, 1, 4, 7], highlights: [2, 3], swapping: [] }], explanation: "Second pass complete. The elements 4 and 7 are now fully sorted at the back." },

    // Outer loop i=2, Inner j=0 (2 vs 1)
    { lineIndex: 4, variables: { n: 4, i: 2, j: 0 }, arrays: [{ id: "arr", values: [2, 1, 4, 7], highlights: [0, 1], swapping: [] }], explanation: "Third pass. Only the first two elements left to check. Compare 2 and 1." },
    { lineIndex: 5, variables: { n: 4, i: 2, j: 0 }, arrays: [{ id: "arr", values: [2, 1, 4, 7], highlights: [0, 1], swapping: [] }], explanation: "2 is greater than 1! Let's swap them to fix the order." },
    { lineIndex: 6, variables: { n: 4, i: 2, j: 0 }, arrays: [{ id: "arr", values: [1, 2, 4, 7], highlights: [], swapping: [0, 1] }], explanation: "Swapped! Real-life analogy: just like swapping a heavier book to the right of a lighter one." },

    // End of i=2
    { lineIndex: 3, variables: { n: 4, i: 3 }, arrays: [{ id: "arr", values: [1, 2, 4, 7], highlights: [0, 1, 2, 3], swapping: [] }], explanation: "The entire array is now sorted!" },

    // Return
    { lineIndex: 7, variables: { n: 4 }, arrays: [{ id: "arr", values: [1, 2, 4, 7], highlights: [0, 1, 2, 3], swapping: [] }], explanation: "We return the fully sorted array back to the caller.", callStack: ["main()", "bubble_sort()"] },
    { lineIndex: 11, variables: {}, arrays: [{ id: "sorted_numbers", values: [1, 2, 4, 7], highlights: [], swapping: [] }], explanation: "Execution finished! Our sorted array is saved in 'sorted_numbers'." }
];

export const examples: Record<string, Example> = {
    "bubble_sort": {
        id: "bubble_sort",
        title: "Bubble Sort",
        description: "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        language: "python",
        code: `def bubble_sort(arr):
      n = len(arr)
      for i in range(n):
          for j in range(0, n-i-1):
              if arr[j] > arr[j+1]:
                  arr[j], arr[j+1] = arr[j+1], arr[j]
      return arr
  
  numbers = [4, 2, 7, 1]
  sorted_numbers = bubble_sort(numbers)
  `,
        steps: bubbleSortSteps
    }
};
