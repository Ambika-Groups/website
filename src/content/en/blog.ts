const blog = {
  meta: {
    title: "Blog | Building, Roads & Paver Work Advice",
    description: "Practical notes from Ambika Group on building houses, road works and interlocking paver work.",
  },
  title: "Blog",
  intro: "Practical notes on building houses, road works and paver work.",
  empty: "No articles yet. Check back soon.",
  allTags: "All topics",
  taggedTitle: (tag: string) => `Articles about ${tag}`,
  readMore: "Read article",
  minutes: (n: number) => `${n} min read`,
  published: "Published",
  updated: "Updated",
  back: "All articles",
  related: "Related work",
  viewProject: "View project",
  ctaTitle: "Planning something similar?",
  ctaBody: "Tell us about your site. Our team calls you back to plan a visit.",
  cta: "Request a site visit",
};

export default blog;
