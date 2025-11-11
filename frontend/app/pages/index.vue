<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Helper to parse [text]{.class} syntax into HTML
const parseStyledText = (text: string) => {
  return text.replace(/\[([^\]]+)\]\{\.([^\}]+)\}/g, '<span class="$2">$1</span>');
};

const page = {
  seo: {
    title: "Nuxt Landing Template",
    description:
      "Boost your coding productivity with AI-driven insights that tell you when and how to code most efficiently.",
  },
  title: "AI-Powered Developer Productivity Platform",
  description:
    "Boost your coding productivity with AI-driven insights that tell you when and how to code most efficiently.",
  hero: {
    links: [
      {
        label: "Get started",
        icon: "i-lucide-arrow-right",
        trailing: true,
        color: "primary",
        to: "https://ui.nuxt.com/docs/getting-started/installation/nuxt",
        target: "_blank",
        size: "xl",
      },
      {
        label: "Clone on GitHub",
        icon: "i-simple-icons-github",
        size: "xl",
        color: "neutral",
        variant: "outline",
        to: "https://github.com/nuxt-ui-templates/landing",
        target: "_blank",
      },
    ],
  },
  section: {
    title: "[Revolutionize]{.text-primary} your coding experience",
    description:
      "Transform your development workflow with AI-powered insights and personalized productivity optimization.",
    images: {
      mobile: "/images/macbook-mobile.svg",
      desktop: "/images/macbook.svg",
    },
    features: [
      {
        title: "Optimize your focus time",
        description:
          "Let AI identify your peak coding hours and adapt to your natural rhythm. Focus on what matters most - writing great code, while our system optimizes your productivity patterns.",
        class: "border-l border-primary pl-4",
      },
      {
        title: "Track your best coding hours",
        description:
          "Track when you code best with smart analytics. Get actionable insights to tackle challenging tasks during your peak performance hours.",
        class: "border-l border-default pt-4 pl-4",
      },
      {
        title: "Improve workflow efficiency",
        description:
          "Automate your workflow optimization from code snippets to focus management. Ship better code faster with a streamlined development process.",
        class: "border-l border-default pt-4 pl-4",
      },
    ],
  },
  features: {
    title: "Take control of your [productivity]{.text-primary}",
    description:
      "Make every coding session count with smart analytics and workflow optimization.",
    features: [
      {
        title: "AI-Powered Focus Tracking",
        description:
          "Discover your optimal coding hours with real-time AI analysis of your productivity patterns.",
        icon: "i-lucide-wand-sparkles",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
      {
        title: "Distraction Alerts",
        description:
          "Get notified when your focus drifts and bring your attention back.",
        icon: "i-lucide-bell-ring",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
      {
        title: "Smart Code Snippets",
        description: "Save and reuse frequently used code blocks for efficiency.",
        icon: "i-lucide-code-xml",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
      {
        title: "Deep Work Mode",
        description:
          "Block distractions and set structured coding sessions with built-in Pomodoro timers.",
        icon: "i-lucide-moon",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
      {
        title: "Collaborative Insights",
        description:
          "Sync your workflow with teammates and see when they are most productive.",
        icon: "i-lucide-mouse-pointer-2",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
      {
        title: "Performance Analytics",
        description:
          "Track your coding metrics and get insights to boost your speed and code quality.",
        icon: "i-lucide-chart-line",
        ui: {
          leading: "bg-accented/50 p-2 rounded-md border border-muted border-dashed",
        },
      },
    ],
  },
  steps: {
    title: "Start coding smarter in [3 steps]{.text-primary}",
    description: "Transform your development workflow with our AI-powered assistant.",
    items: [
      {
        title: "Connect Your IDE",
        description:
          "Seamlessly integrate with VS Code, JetBrains, or your preferred editor. Get started in under 2 minutes with zero configuration needed.",
        image: {
          light: "/images/light/connect.svg",
          dark: "/images/dark/connect.svg",
        },
      },
      {
        title: "Track & Analyze",
        description:
          "Our AI silently monitors your coding patterns to identify your peak productivity hours and potential workflow bottlenecks.",
        image: {
          light: "/images/light/optimize.svg",
          dark: "/images/dark/optimize.svg",
        },
      },
      {
        title: "Optimize & Code Smarter",
        description:
          "Receive personalized recommendations to enhance your coding efficiency. Watch your productivity soar with data-driven insights.",
        image: {
          light: "/images/light/track.svg",
          dark: "/images/dark/track.svg",
        },
      },
    ],
  },
  pricing: {
    title: "Choose your [productivity]{.text-primary} path",
    description:
      "Unlock AI-powered coding efficiency with our flexible plans. Whether you're a solo developer or part of a team, we have the perfect toolset to maximize your development workflow.",
    plans: [
      {
        title: "Pro Developer",
        description: "Perfect for individual developers focused on maximizing productivity.",
        price: "$199",
        billing_period: "month",
        billing_cycle: "",
        highlight: false,
        features: [
          "AI productivity tracking to optimize your peak coding hours",
          "Smart distraction alerts to maintain deep focus",
          "Personal code snippet library for faster development",
          "Deep Work Mode with Pomodoro timer integration",
          "Performance analytics dashboard",
          "Priority email support",
        ],
        button: {
          label: "Buy now",
          color: "neutral",
          variant: "outline",
          to: "#",
        },
      },
      {
        title: "Team Developer",
        description: "For bootstrappers and indie hackers.",
        price: "$199",
        billing_period: "month",
        billing_cycle: "",
        highlight: true,
        features: [
          "Everything in Pro Developer",
          "Team productivity analytics and insights",
          "Collaborative code snippet sharing",
          "Cross-team performance tracking",
          "Synchronized deep work sessions",
          "Priority team support with dedicated manager",
        ],
        button: {
          label: "Buy now",
          variant: "subtle",
          to: "#",
        },
      },
    ],
  },
  testimonials: {
    title: "Join thousands of productive [developers]{.text-primary}",
    description:
      "See how developers are transforming their coding workflow and achieving more with our AI-powered platform.",
    items: [
      {
        quote:
          "Since using this tool, my productivity has doubled. The AI insights helped me find my perfect coding rhythm and now I ship features twice as fast.",
        user: {
          name: "Sarah Moriceau",
          description: "Brand Designer",
          target: "_blank",
          avatar: {
            src: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/SarahM19",
          },
        },
      },
      {
        quote:
          "Game-changer for our team. The focus tracking and smart alerts helped us reduce meeting interruptions by 40% and increased our sprint velocity.",
        user: {
          name: "Sébastien Chopin",
          description: "Lead Software Engineer",
          target: "_blank",
          avatar: {
            src: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/atinux",
          },
        },
      },
      {
        quote:
          "Finally, a productivity tool that understands developers. The AI features helped me identify my peak coding hours and now I accomplish more in less time.",
        user: {
          name: "Benjamin Canac",
          description: "Senior Frontend Developer",
          target: "_blank",
          avatar: {
            src: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/benjamincanac",
          },
        },
      },
    ],
  },
  cta: {
    title: "Ready to build an amazing landing page?",
    description:
      "Join thousands of developers building with Nuxt and Nuxt UI. Get this template and start shipping today.",
    links: [
      {
        label: "Start building",
        to: "https://ui.nuxt.com/docs/getting-started/installation/nuxt",
        target: "_blank",
        trailingIcon: "i-lucide-arrow-right",
      },
      {
        label: "View on GitHub",
        to: "https://github.com/nuxt-ui-templates/landing",
        target: "_blank",
        variant: "subtle",
        icon: "i-simple-icons-github",
      },
    ],
  },
};

useSeoMeta({
  title: page.seo?.title || page.title,
  ogTitle: page.seo?.title || page.title,
  description: page.seo?.description || page.description,
  ogDescription: page.seo?.description || page.description,
});
</script>

<template>
  <div class="relative">
    <div class="hidden lg:block">
      <UColorModeImage
        light="/images/light/line-1.svg"
        dark="/images/dark/line-1.svg"
        class="pointer-events-none absolute top-0 left-0 h-[650px] object-cover pb-10"
      />
    </div>

    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
      :ui="{
        container: 'md:pt-18 lg:pt-20',
        title: 'max-w-3xl mx-auto',
      }"
    >
      <template #top>
        <HomeHeroBackground />
      </template>
    </UPageHero>

    <UPageSection
      :description="page.section.description"
      :features="page.section.features"
      orientation="horizontal"
      :ui="{
        container: 'lg:px-0 2xl:px-20 mx-0 max-w-none md:mr-10',
        features: 'gap-0',
      }"
      reverse
    >
      <template #title>
        <h2 class="sm:leading-11" v-html="parseStyledText(page.section.title)" />
      </template>
      <img
        :src="page.section.images.desktop"
        :alt="page.section.title"
        class="left-0 hidden w-full max-w-2xl lg:block 2xl:hidden"
      />
      <img
        :src="page.section.images.mobile"
        :alt="page.section.title"
        class="block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl"
      />
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection
      id="features"
      :description="page.features.description"
      :features="page.features.features"
      :ui="{
        title: 'text-left @container relative flex',
        description: 'text-left',
      }"
      class="relative overflow-hidden"
    >
      <template #title>
        <h2 class="leading-9" v-html="parseStyledText(page.features.title)" />
        <div class="hidden @min-[1020px]:block">
          <UColorModeImage
            light="/images/light/line-2.svg"
            dark="/images/dark/line-2.svg"
            class="absolute top-0 right-0 size-full translate-x-[70%] scale-95 transform"
          />
        </div>
      </template>

      <div
        class="bg-primary absolute top-10 -left-10 z-10 size-[300px] rounded-full opacity-30 blur-[200px]"
      />
      <div
        class="bg-primary absolute -right-10 -bottom-10 z-10 size-[300px] rounded-full opacity-30 blur-[200px]"
      />
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection
      id="steps"
      :description="page.steps.description"
      class="relative overflow-hidden"
    >
      <template #title>
        <h2 v-html="parseStyledText(page.steps.title)" />
      </template>
      <template #headline>
        <UColorModeImage
          light="/images/light/line-3.svg"
          dark="/images/dark/line-3.svg"
          class="absolute -top-10 right-1/2 h-24 sm:top-0"
        />
      </template>

      <template #features>
        <UPageCard
          v-for="(step, index) in page.steps.items"
          :key="index"
          class="group"
          :ui="{ container: 'p-4 sm:p-4', title: 'flex items-center gap-1' }"
        >
          <UColorModeImage
            v-if="step.image"
            :light="step.image?.light"
            :dark="step.image?.dark"
            :alt="step.title"
            class="size-full"
          />

          <div class="flex flex-col gap-2">
            <span class="text-lg font-semibold">
              {{ step.title }}
            </span>
            <span class="text-muted text-sm">
              {{ step.description }}
            </span>
          </div>
        </UPageCard>
      </template>
    </UPageSection>

    <UPageSection
      id="pricing"
      class="mb-32 overflow-hidden"
      :description="page.pricing.description"
      :plans="page.pricing.plans"
      :ui="{ title: 'text-left @container relative', description: 'text-left' }"
    >
      <template #title>
        <h2 v-html="parseStyledText(page.pricing.title)" />
        <div class="hidden @min-[1120px]:block">
          <UColorModeImage
            light="/images/light/line-4.svg"
            dark="/images/dark/line-4.svg"
            class="absolute top-0 right-0 size-full translate-x-[60%] transform"
          />
        </div>
      </template>

      <UPricingPlans scale>
        <UPricingPlan
          v-for="(plan, index) in page.pricing.plans"
          :key="index"
          :title="plan.title"
          :description="plan.description"
          :price="plan.price"
          :billing-period="plan.billing_period"
          :billing-cycle="plan.billing_cycle"
          :highlight="plan.highlight"
          :scale="plan.highlight"
          variant="soft"
          :features="plan.features"
          :button="plan.button"
        />
      </UPricingPlans>
    </UPageSection>

    <UPageSection
      id="testimonials"
      :description="page.testimonials.description"
      :items="page.testimonials.items"
    >
      <template #title>
        <h2 v-html="parseStyledText(page.testimonials.title)" />
      </template>
      <template #headline>
        <UColorModeImage
          light="/images/light/line-5.svg"
          dark="/images/dark/line-5.svg"
          class="absolute -top-10 right-1/2 h-24 sm:top-0"
        />
      </template>

      <UContainer>
        <UPageColumns class="xl:columns-3">
          <UPageCard
            v-for="(testimonial, index) in page.testimonials.items"
            :key="index"
            variant="subtle"
            :description="testimonial.quote"
            :ui="{
              description:
                'before:content-[open-quote] after:content-[close-quote]',
            }"
          >
            <template #footer>
              <UUser v-bind="testimonial.user" size="xl" />
            </template>
          </UPageCard>
        </UPageColumns>
      </UContainer>
    </UPageSection>

    <USeparator />

    <UPageCTA
      :description="page.cta.description"
      :links="page.cta.links"
      variant="naked"
      class="@container overflow-hidden"
    >
      <template #title>
        <h2 v-html="parseStyledText(page.cta.title)" />
        <div class="@max-[1280px]:hidden">
          <UColorModeImage
            light="/images/light/line-6.svg"
            dark="/images/dark/line-6.svg"
            class="absolute -top-10 left-10 h-full sm:top-0"
          />
          <UColorModeImage
            light="/images/light/line-7.svg"
            dark="/images/dark/line-7.svg"
            class="absolute right-0 bottom-0 h-full"
          />
        </div>
      </template>

      <LazyHomeStarsBg />
    </UPageCTA>
  </div>
</template>
