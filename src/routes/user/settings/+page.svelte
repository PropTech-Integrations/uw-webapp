<div class="px-4 pt-4">
	<nav class="mb-4 flex" aria-label="Breadcrumb">
	  <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
		<li class="inline-flex items-center">
		  <a href="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white">
			<svg class="me-2.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
			  <path fill-rule="evenodd" d="M11.3 3.3a1 1 0 0 1 1.4 0l6 6 2 2a1 1 0 0 1-1.4 1.4l-.3-.3V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3c0 .6-.4 1-1 1H7a2 2 0 0 1-2-2v-6.6l-.3.3a1 1 0 0 1-1.4-1.4l2-2 6-6Z" clip-rule="evenodd" />
			</svg>
			Home
		  </a>
		</li>
		<li>
		  <div class="flex items-center">
			<svg class="mx-1 h-4 w-4 text-gray-400 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
			</svg>
			<a href="/" class="ms-1 text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white md:ms-2">User</a>
		  </div>
		</li>
		<li aria-current="page">
		  <div class="flex items-center">
			<svg class="mx-1 h-4 w-4 text-gray-400 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
			</svg>
			<span class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">Settings</span>
		  </div>
		</li>
	  </ol>
	</nav>
	<h1 class="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
  </div>
  <div class="gap-4 p-4 xl:grid xl:grid-cols-2">
	<div class="col-span-2 mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6 xl:mb-0">
	  <h2 class="mb-4 md:mb-6 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">General information</h2>
	  <form action="#">
		<div class="mb-4 grid gap-4 sm:mb-6 sm:grid-cols-2 md:grid-cols-3">
		  <div class="col-span-1 space-y-4">
			<div>
			  <label for="name" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Your name*</label>
			  <input
				type="text"
				name="name"
				id="fullname"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Ex. Bonnie Green"
				required
			  />
			</div>
			<div>
			  <label for="zip" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">ZIP/Postal code</label>
			  <input
				type="number"
				name="zip"
				id="zip"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Ex. 123456"
				required
			  />
			</div>
			<div>
			  <label for="country" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Country*</label>
			  <input
				type="text"
				name="country"
				id="country"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="United States"
				required
			  />
			</div>
			<div>
			  <label for="city" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Town/City*</label>
			  <input
				type="text"
				name="city"
				id="city"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Ex. Sacramento"
				required
			  />
			</div>
		  </div>
		  <div class="col-span-1 space-y-4">
			<div>
			  <label for="address" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Full address*</label>
			  <input
				type="text"
				name="address"
				id="address"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="174 Cayuga Ave, San Francisco, CA 94112"
				required
			  />
			</div>
			<div>
			  <label for="organization" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Your organization</label>
			  <input
				type="text"
				name="organization"
				id="organization"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Ex. Flowbite LLC"
				required
			  />
			</div>
			<div>
			  <label for="department" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Department</label>
			  <input
				type="text"
				name="department"
				id="department"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Marketing"
				required
			  />
			</div>
			<div>
			  <label for="account-type" class="mb-2 flex items-center text-sm font-medium text-gray-900 dark:text-white"
				>Account Type<button data-tooltip-target="tooltip-account-type-description" class="ms-1 text-gray-400 hover:text-gray-900 dark:hover:text-white" type="button">
				  <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
					<path
					  fill-rule="evenodd"
					  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.008-3.018a1.502 1.502 0 0 1 2.522 1.159v.024a1.44 1.44 0 0 1-1.493 1.418 1 1 0 0 0-1.037.999V14a1 1 0 1 0 2 0v-.539a3.44 3.44 0 0 0 2.529-3.256 3.502 3.502 0 0 0-7-.255 1 1 0 0 0 2 .076c.014-.398.187-.774.48-1.044Zm.982 7.026a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2h-.01Z"
					  clip-rule="evenodd"
					/>
				  </svg>
				  <span class="sr-only">Show information</span>
				</button></label
			  >
			  <select
				id="account-type"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  >
				<option selected>Choose your account type</option>
				<option value="personal">Personal</option>
				<option value="business">Business</option>
				<option value="education">Education/University</option>
			  </select>
			  <div
				id="tooltip-account-type-description"
				role="tooltip"
				class="tooltip invisible absolute z-10 inline-block w-72 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600"
			  >
				This indicates the classification of your account, defining the set of features, and access rights associated with it.
				<div class="tooltip-arrow" data-popper-arrow></div>
			  </div>
			</div>
		  </div>
		  <div class="col-span-1 sm:col-span-2 md:col-span-1">
			<label for="message" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Biography</label>
			<textarea
			  id="message"
			  rows="14"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Hello, my name is Bonnie Green..."
			></textarea>
		  </div>
		</div>
		<button
		  type="submit"
		  class="w-full rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto"
		>
		  Save changes
		</button>
	  </form>
	</div>
	<div class="col-span-2 mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6 xl:mb-0">
	  <h2 class="mb-4 md:mb-6 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Social</h2>
	  <form action="#">
		<div class="mb-4 grid gap-4 sm:mb-6 sm:grid-cols-2">
		  <div>
			<label for="facebook" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Facebook</label>
			<input
			  type="text"
			  name="facebook"
			  id="facebook"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your facebook account"
			  required
			/>
		  </div>
		  <div>
			<label for="dribbble" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Dribbble</label>
			<input
			  type="text"
			  name="dribbble"
			  id="dribbble"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your dribbble account"
			  required
			/>
		  </div>
		  <div>
			<label for="twitter" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Twitter</label>
			<input
			  type="text"
			  name="twitter"
			  id="twitter"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your twitter account"
			  required
			/>
		  </div>
		  <div>
			<label for="behance" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Behance</label>
			<input
			  type="text"
			  name="behance"
			  id="behance"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your behance account"
			  required
			/>
		  </div>
		  <div>
			<label for="github" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Github</label>
			<input
			  type="text"
			  name="github"
			  id="github"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your github account"
			  required
			/>
		  </div>
		  <div>
			<label for="pinterest" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Pinterest</label>
			<input
			  type="text"
			  name="pinterest"
			  id="pinterest"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your pinterest account"
			  required
			/>
		  </div>
		  <div>
			<label for="instagram" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Instagram</label>
			<input
			  type="text"
			  name="instagram"
			  id="instagram"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your instagram account"
			  required
			/>
		  </div>
		  <div>
			<label for="tiktok" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">TikTok</label>
			<input
			  type="text"
			  name="tiktok"
			  id="tiktok"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Enter your tiktok account"
			  required
			/>
		  </div>
		</div>
		<button
		  type="submit"
		  class="w-full rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto"
		>
		  Save changes
		</button>
	  </form>
	</div>
  </div>