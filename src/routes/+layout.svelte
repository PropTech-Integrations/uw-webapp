<script lang="ts">
	//  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, ImagePlaceholder, Skeleton, TextPlaceholder } from "flowbite-svelte";
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
	import '../app.css';
	// import Logo from '$lib/components/Logo/Logo.svelte';
	let { children } = $props();
</script>

<!-- <div class="relative px-8">
	<Navbar class="w-full bg-white px-2 py-2.5 sm:px-4 dark:bg-gray-800">
	  <NavBrand href="/">
		<Logo />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">StratiqAI</span>
	  </NavBrand>
	  <NavHamburger />
	  <NavUl>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/pricing">Pricing</NavLi>
		<NavLi href="/contact">Contact</NavLi>
	  </NavUl>
	</Navbar>

  </div> -->
<div class="flex min-h-screen ">
	<Sidebar />
	{@render children()}
</div>
