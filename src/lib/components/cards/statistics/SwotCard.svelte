<script>
	import { Heading, P, Button, Card, List, Li } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
</script>

<P class="my-8">A SWOT Analysis is a strategic tool used to identify an organization's internal Strengths and Weaknesses, as well as external Opportunities and Threats. It helps businesses strategically leverage advantages, address limitations, exploit favorable trends, and mitigate risks to improve decision-making, optimize performance, and achieve long-term goals.</P>
<div class="grid grid-cols-2 gap-4 mx-32">
	<Card class="max-w-4xl rounded-none rounded-tl-3xl" href="/cards">
		<Heading
			tag="h5"
			class="mb-4"
			customSize="text-xl font-extrabold tracking-tight md:text-xl lg:text-2xl"
		>
			Strengths
		</Heading>
		<List>
			<Li>Strong relationships with vendors and lenders facilitating smoother renovations.</Li>
			<Li>Local market expertise enhancing property management effectiveness.</Li>
			<Li>Quality renovations improving tenant satisfaction and retention.</Li>
			<Li>Responsive service attracting and maintaining high occupancy rates.</Li>
			<Li>Ability to leverage investor capital for significant property value increases.</Li>
		</List>
	</Card>
	<Card class="max-w-4xl rounded-none rounded-tr-3xl" href="/cards">
		<Heading
			tag="h5"
			class="mb-4"
			customSize="text-xl font-extrabold tracking-tight md:text-xl lg:text-2xl"
		>
			Weaknesses
		</Heading>
		<List>
			<Li>High initial capital investment required for acquisitions and renovations.</Li>
			<Li>Dependence on investor capital may limit flexibility in decision-making.</Li>
			<Li>Potential challenges in finding reliable property management teams.</Li>
			<Li>Market fluctuations could affect rental income stability.</Li>
			<Li>Limited brand recognition in a competitive market.</Li>
		</List>
	</Card>
	<Card class="max-w-4xl rounded-none rounded-bl-3xl" href="/cards">
		<Heading
			tag="h5"
			class="mb-4"
			customSize="text-xl font-extrabold tracking-tight md:text-xl lg:text-2xl"
		>
			Opportunities
		</Heading>
		<List>
			<Li>Expanding into other aging apartment complexes with similar challenges.</Li>
			<Li>Increasing demand for modernized rental units in desirable locations</Li>
			<Li>Potential partnerships with local businesses for tenant services.</Li>
			<Li>Growing interest in sustainable renovations attracting eco-conscious tenants.</Li>
			<Li>Utilizing technology for efficient property management and tenant communication.</Li>
		</List>
	</Card>
	<Card class="max-w-4xl rounded-none rounded-br-3xl" href="/cards">
		<Heading
			tag="h5"
			class="mb-4"
			customSize="text-xl font-extrabold tracking-tight md:text-xl lg:text-2xl"
		>
			Threats
		</Heading>
		<List>
			<Li>Intense competition from established real estate investors and firms.</Li>
			<Li>Economic downturns affecting rental demand and property values.</Li>
			<Li>Regulatory changes impacting rental agreements and property management.</Li>
			<Li>Rising construction costs potentially reducing renovation margins.</Li>
			<Li>Market saturation in the Santa Rosa area limiting growth potential.</Li>
		</List>
	</Card>
</div>
