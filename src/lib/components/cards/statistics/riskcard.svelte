<script lang="ts">
    // No script needed for this static layout
  </script>
  
  <div class="p-4 bg-white rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Risk Matrix</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Low Risk</span>
        <div class="w-5 h-5 rounded-sm bg-blue-200"></div>
        <div class="w-5 h-5 rounded-sm bg-blue-300"></div>
        <div class="w-5 h-5 rounded-sm bg-blue-500"></div>
        <div class="w-5 h-5 rounded-sm bg-blue-600"></div>
        <div class="w-5 h-5 rounded-sm bg-blue-800"></div>
        <span class="text-sm">High Risk</span>
        <div class="flex items-center space-x-1">
          <button aria-label="Low Risk" class="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.582m-.356-2A8.001 8.001 0 0119.418 15m0 0H15"></path></svg>
          </button>
          <button aria-label="High Risk" class="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  
    <div class="flex">
      <div class="flex flex-col justify-around items-center mr-4 text-sm">
        <div class="h-16 flex items-center justify-center">76%-100%</div>
        <div class="h-16 flex items-center justify-center">51%-75%</div>
        <div class="h-16 flex items-center justify-center">26%-50%</div>
        <div class="h-16 flex items-center justify-center">0%-25%</div>
        <div class="mt-4 text-center text-sm font-semibold transform -rotate-90 whitespace-nowrap origin-center">Probability</div>
      </div>
  
      <div class="grid grid-cols-4 gap-2 flex-grow">
        <!-- Row 1 -->
        <div class="bg-blue-300 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-500 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-600 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-800 rounded-lg h-20 flex items-center justify-center p-1"></div>
  
        <!-- Row 2 -->
        <div class="bg-blue-200 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-300 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-500 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-600 rounded-lg h-20 flex items-center justify-center p-1"></div>
  
        <!-- Row 3 -->
        <div class="bg-blue-100 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-200 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-500 rounded-lg h-20 flex flex-col items-start justify-center space-y-1 px-2">
          <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Costrisk</div>
          <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Manage...</div>
          <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Marketri...</div>
        </div>
        <div class="bg-blue-600 rounded-lg h-20 flex items-center justify-center p-1"></div>
  
        <!-- Row 4 -->
        <div class="bg-blue-100 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-200 rounded-lg h-20 flex flex-col items-start justify-center space-y-1 px-2">
           <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Investorr...</div>
           <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Regulato...</div>
        </div>
        <div class="bg-blue-300 rounded-lg h-20 flex items-center justify-center p-1"></div>
        <div class="bg-blue-500 rounded-lg h-20 flex items-center justify-center p-1"></div>
      </div>
    </div>
  
    <div class="flex justify-around text-sm mt-2">
      <div class="w-1/4 text-center">Low</div>
      <div class="w-1/4 text-center">Moderate</div>
      <div class="w-1/4 text-center">High</div>
      <div class="w-1/4 text-center">Critical</div>
    </div>
      <div class="text-center text-sm font-semibold mt-2">Impact</div>
  </div>