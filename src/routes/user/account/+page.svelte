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
			<span class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">Account</span>
		  </div>
		</li>
	  </ol>
	</nav>
	<!-- <h1 class="text-xl font-bold text-gray-900 dark:text-white">Account</h1> -->
  </div>
  <div class="gap-4 p-4 mt-0 pt-0 xl:grid xl:grid-cols-1">
	<div class="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6 xl:mb-0">
	  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
	  <div class="my-4 flex w-full items-center">
		<img class="mb-4 me-4 h-20 w-20 rounded-full sm:mb-0" src="/images/remove/dh.jpg" alt="Me, Myself and I" />
		<div class="w-full items-center space-x-0 space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
		  <button
			type="button"
			class="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto"
		  >
			<svg class="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
			  <path
				fill-rule="evenodd"
				d="M12 3c.3 0 .6.1.8.4l4 5a1 1 0 1 1-1.6 1.2L13 7v7a1 1 0 1 1-2 0V6.9L8.8 9.6a1 1 0 1 1-1.6-1.2l4-5c.2-.3.5-.4.8-.4ZM9 14v-1H5a2 2 0 0 0-2 2v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0Zm8 2a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z"
				clip-rule="evenodd"
			  />
			</svg>
			Upload
		  </button>
		  <button
			type="button"
			class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto"
		  >
			Remove
		  </button>
		</div>
	  </div>
	  <form action="#">
		<div class="mb-4 grid gap-4 sm:mb-6 sm:grid-cols-2">
		  <div>
			<label for="username" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Username*</label>
			<input
			  type="text"
			  name="username"
			  id="username"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Ex. BonnieG"
			  required
			/>
		  </div>
		  <div>
			<label for="fullname" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Full name*</label>
			<input
			  type="text"
			  name="fullname"
			  id="fullname"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			  placeholder="Ex. Bonnie Green"
			  required
			/>
		  </div>
		  <div>
			<label for="email" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Your email*</label>
			<div class="relative">
			  <div class="pointer-events-none absolute inset-y-0 start-0 top-0 flex items-center ps-3.5">
				<svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path d="M2 5.6V18c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V5.6l-.9.7-7.9 6a2 2 0 0 1-2.4 0l-8-6-.8-.7Z" />
				  <path d="M20.7 4.1A2 2 0 0 0 20 4H4a2 2 0 0 0-.6.1l.7.6 7.9 6 7.9-6 .8-.6Z" />
				</svg>
			  </div>
			  <input
				type="email"
				name="email"
				id="email"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="name@example.com"
				required
			  />
			</div>
		  </div>
		  <div>
			<label for="phone-input" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Phone number</label>
			<div class="relative">
			  <div class="pointer-events-none absolute inset-y-0 start-0 top-0 flex items-center ps-3.5">
				<svg class="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path
					fill-rule="evenodd"
					d="M11 4a1 1 0 0 0-1 1v10h10.5l.5-3h-5a1 1 0 1 1 0-2h5.3l.2-1H16a1 1 0 1 1 0-2h5.9v-.7A2 2 0 0 0 20.2 4H11ZM9 18c0-.4 0-.7.2-1h11.6l.2 1v1c0 .6-.4 1-1 1H10a1 1 0 0 1-1-1v-1Zm-7-7c0 2 .3 4.1 1 6.1.2.5 1.6.9 2.2.9h1.3l.5-.1c.2 0 .3-.1.4-.3.2 0 .2-.2.3-.4v-.4l-.2-2.2a1 1 0 0 0-.4-.7c-.2-.2-.5-.3-.8-.3h-1L5 11c0-.9 0-1.7.2-2.6h1.2l.9-.3.4-.7.2-2.2v-.4a1 1 0 0 0-.3-.4c-.1-.2-.3-.2-.4-.3L6.8 4H4.3c-.3 0-.6 0-.8.2-.3.2-.5.4-.6.7-.6 2-1 4-.9 6.1Z"
					clip-rule="evenodd"
				  />
				</svg>
			  </div>
			  <input
				type="text"
				id="phone-input"
				aria-describedby="helper-text-explanation"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
				placeholder="123-456-7890"
				required
			  />
			</div>
		  </div>
		  <div>
			<label for="timezone" class="mb-2 flex items-center text-sm font-medium text-gray-900 dark:text-white"
			  >Timezone<button data-tooltip-target="tooltip-timezone-description" class="ms-1 text-gray-400 hover:text-gray-900 dark:hover:text-white" type="button">
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
			  id="timezone"
			  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
			>
			  <option selected>UTC-08:00 - Pacific Standard Time (PST)</option>
			  <option value="-12:00">(GMT -12:00) Eniwetok, Kwajalein</option>
			  <option value="-11:00">(GMT -11:00) Midway Island, Samoa</option>
			  <option value="-10:00">(GMT -10:00) Hawaii</option>
			  <option value="-09:50">(GMT -9:30) Taiohae</option>
			  <option value="-09:00">(GMT -9:00) Alaska</option>
			  <option value="-08:00" selected="selected">(GMT -8:00) Pacific Time (US &amp; Canada)</option>
			  <option value="-07:00">(GMT -7:00) Mountain Time (US &amp; Canada)</option>
			  <option value="-06:00">(GMT -6:00) Central Time (US &amp; Canada), Mexico City</option>
			  <option value="-05:00">(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima</option>
			  <option value="-04:50">(GMT -4:30) Caracas</option>
			  <option value="-04:00">(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz</option>
			  <option value="-03:50">(GMT -3:30) Newfoundland</option>
			  <option value="-03:00">(GMT -3:00) Brazil, Buenos Aires, Georgetown</option>
			  <option value="-02:00">(GMT -2:00) Mid-Atlantic</option>
			  <option value="-01:00">(GMT -1:00) Azores, Cape Verde Islands</option>
			  <option value="+00:00">(GMT) Western Europe Time, London, Lisbon, Casablanca</option>
			  <option value="+01:00">(GMT +1:00) Brussels, Copenhagen, Madrid, Paris</option>
			  <option value="+02:00">(GMT +2:00) Kaliningrad, South Africa</option>
			  <option value="+03:00">(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg</option>
			  <option value="+03:50">(GMT +3:30) Tehran</option>
			  <option value="+04:00">(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
			  <option value="+04:50">(GMT +4:30) Kabul</option>
			  <option value="+05:00">(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent</option>
			  <option value="+05:50">(GMT +5:30) Bombay, Calcutta, Madras, New Delhi</option>
			  <option value="+05:75">(GMT +5:45) Kathmandu, Pokhara</option>
			  <option value="+06:00">(GMT +6:00) Almaty, Dhaka, Colombo</option>
			  <option value="+06:50">(GMT +6:30) Yangon, Mandalay</option>
			  <option value="+07:00">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
			  <option value="+08:00">(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option>
			  <option value="+08:75">(GMT +8:45) Eucla</option>
			  <option value="+09:00">(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk</option>
			  <option value="+09:50">(GMT +9:30) Adelaide, Darwin</option>
			  <option value="+10:00">(GMT +10:00) Eastern Australia, Guam, Vladivostok</option>
			  <option value="+10:50">(GMT +10:30) Lord Howe Island</option>
			  <option value="+11:00">(GMT +11:00) Magadan, Solomon Islands, New Caledonia</option>
			  <option value="+11:50">(GMT +11:30) Norfolk Island</option>
			  <option value="+12:00">(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka</option>
			  <option value="+12:75">(GMT +12:45) Chatham Islands</option>
			  <option value="+13:00">(GMT +13:00) Apia, Nukualofa</option>
			  <option value="+14:00">(GMT +14:00) Line Islands, Tokelau</option>
			</select>
			<div
			  id="tooltip-timezone-description"
			  role="tooltip"
			  class="tooltip invisible absolute z-10 inline-block w-72 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600"
			>
			  A timezone is a region of the Earth that has the same standard time.
			  <div class="tooltip-arrow" data-popper-arrow></div>
			</div>
		  </div>
		  <div>
			<label for="account-type" class="mb-2 flex items-center text-sm font-medium text-gray-900 dark:text-white"
			  >Account Type<button data-tooltip-target="tooltip-account-type-description-2" class="ms-1 text-gray-400 hover:text-gray-900 dark:hover:text-white" type="button">
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
			  id="tooltip-account-type-description-2"
			  role="tooltip"
			  class="tooltip invisible absolute z-10 inline-block w-72 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600"
			>
			  This indicates the classification of your account, defining the set of privileges, and access rights associated with it.
			  <div class="tooltip-arrow" data-popper-arrow></div>
			</div>
		  </div>
		</div>

		<button
		  type="submit"
		  class="mt-4 w-full rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mt-6 sm:w-auto"
		>
		  Save changes
		</button>
	  </form>
	</div>

	<div class="col-span-2 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
	  <h2 class="mb-4 md:mb-6 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Password</h2>
	  <form action="#">
		<div class="mb-4 grid gap-4 sm:mb-6 sm:grid-cols-2">
		  <div class="col-span-1 space-y-4">
			<div>
			  <label for="current-password" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Current password</label>
			  <input
				type="password"
				name="current-password"
				id="current-password"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Enter your current password"
				required
			  />
			</div>
			<div>
			  <label for="new-password" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Your new password</label>
			  <input
				type="password"
				name="new-password"
				id="new-password"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Enter your new password"
				required
			  />
			</div>
			<div>
			  <label for="confirm-password" class="mb-2 flex text-sm font-medium text-gray-900 dark:text-white">Confirm new password</label>
			  <input
				type="password"
				name="confirm-password"
				id="confirm-password"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
				placeholder="Confirm new password"
				required
			  />
			</div>
		  </div>
		  <div class="col-span-1 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
			<h3 class="mb-1 text-sm font-medium text-gray-900 dark:text-white">Password requirements:</h3>
			<p class="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">Ensure that these requirements are met:</p>
			<ul class="space-y-2 text-sm text-gray-500 dark:text-gray-400">
			  <li class="flex items-center">
				<svg class="me-2 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path fill-rule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm13.7-1.3a1 1 0 0 0-1.4-1.4L11 12.6l-1.8-1.8a1 1 0 0 0-1.4 1.4l2.5 2.5c.4.4 1 .4 1.4 0l4-4Z" clip-rule="evenodd" />
				</svg>
				At least 10 characters (and up to 100 characters)
			  </li>
			  <li class="flex items-center">
				<svg class="me-2 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path fill-rule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm13.7-1.3a1 1 0 0 0-1.4-1.4L11 12.6l-1.8-1.8a1 1 0 0 0-1.4 1.4l2.5 2.5c.4.4 1 .4 1.4 0l4-4Z" clip-rule="evenodd" />
				</svg>
				At least one lowercase character
			  </li>
			  <li class="flex items-center">
				<svg class="me-2 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path
					fill-rule="evenodd"
					d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm7.7-3.7a1 1 0 0 0-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 1 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L13.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L12 10.6 9.7 8.3Z"
					clip-rule="evenodd"
				  />
				</svg>
				Inclusion of at least one special character, e.g., ! @ # ?
			  </li>
			  <li class="flex items-center">
				<svg class="me-2 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
				  <path
					fill-rule="evenodd"
					d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm7.7-3.7a1 1 0 0 0-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 1 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L13.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L12 10.6 9.7 8.3Z"
					clip-rule="evenodd"
				  />
				</svg>
				Significantly different from your previous passwords
			  </li>
			</ul>
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