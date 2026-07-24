import React, { useState } from 'react';
import {
  Apple,
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Coins,
  MessageSquare,
  Monitor,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import './PlansView.css';

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    tableName: 'Free',
    color: '#f4f4f4',
    yearly: 0,
    monthly: 0,
    oldYearly: null,
    oldMonthly: null,
    description: 'Casual creators who want to explore AI art',
    features: [
      '150 Fast Tokens daily for quick creations',
      'All images and videos are public',
      'Use Presets for easy image creation',
      'Basic quality settings',
      '1 personal collection',
    ],
  },
  {
    id: 'essential',
    name: 'ESSENTIAL',
    tableName: 'Essential',
    color: '#f7c62f',
    yearly: 10,
    monthly: 12,
    oldYearly: 12,
    oldMonthly: null,
    description: 'Daily hobbyists and enthusiasts',
    extra: 'Included with Lumina Business',
    features: [
      '8,500 Fast Tokens Monthly',
      'Private creations - only you decide who sees your work',
      '25,500 Token Bank',
      'Train up to 10 personal AI models per month',
      'Unlock Enhanced Quality Generation & Upscaling',
      'Unlimited collections',
      'Run 2 generations simultaneously',
      'Purchase and use Top-up Tokens',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    tableName: 'Premium',
    color: '#00e66d',
    yearly: 24,
    monthly: 30,
    oldYearly: 30,
    oldMonthly: null,
    description: 'Semi-professionals and active creators who need more output',
    best: true,
    features: [
      '25,000 Fast Tokens Monthly',
      'Unlimited relaxed Image Generation for selected models*',
      '75,000 Token Bank',
      'Train up to 20 personal AI models per month',
      'Unlock Enhanced Quality Generation & Upscaling',
      'Unlimited collections',
      'Run 3 generations simultaneously',
      'Queue up to 10 generations',
      'Purchase and use Top-up Tokens',
    ],
  },
  {
    id: 'ultimate',
    name: 'ULTIMATE',
    tableName: 'Ultimate',
    color: '#ff6556',
    yearly: 48,
    monthly: 60,
    oldYearly: 60,
    oldMonthly: null,
    description: 'Professional creators, small businesses, and content producers',
    features: [
      '60,000 Fast Tokens Monthly',
      'Unlimited relaxed Image Generation for selected models*',
      'Unlimited relaxed Video Generation for selected models*',
      '180,000 Token Bank',
      'Train up to 50 personal AI models per month',
      'Unlimited Ultra generations*',
      'Unlimited collections',
      'Run 6 generations simultaneously',
      'Queue up to 20 generations',
      'Purchase and use Top-up Tokens',
    ],
  },
  {
    id: 'teams',
    name: 'LUMINA FOR TEAMS',
    tableName: 'Teams Plan',
    color: '#f4f4f4',
    yearly: null,
    monthly: null,
    description: 'Design teams, studios, agencies, and businesses',
    team: true,
    features: [
      'Shared Fast Tokens pool',
      'Unlimited relaxed Generations for all members for selected models*',
      'Shared Token Bank',
      'Priority customer support',
      'Enterprise-grade security & IP protection',
      'Team collections & shared workspaces',
      'Centralized billing & management',
      'Streamlined team workflows',
    ],
  },
];

const COMPARISON_SECTIONS = [
  {
    title: 'Generation Power',
    icon: Coins,
    rows: [
      ['Subscription Tokens', '150 Fast Tokens Daily', '8,500 Fast Tokens Monthly', '25,000 Fast Tokens Monthly', '60,000 Fast Tokens Monthly', 'Shared Fast Tokens among All Team Members'],
      ['Token Bank', false, 'Unused tokens rollover up to 25,500', 'Unused tokens rollover up to 75,000', 'Unused tokens rollover up to 180,000', 'Shared Token Bank Capacity'],
      ['Top-up Tokens', false, true, true, true, true],
      ['Concurrent Generations', false, 'Generate 2 jobs concurrently', 'Generate 3 jobs concurrently', 'Generate 6 jobs concurrently', 'Generate 6 jobs concurrently'],
      ['Generation Queue', true, 'Queue up to 5 generations', 'Queue up to 10 generations', 'Queue up to 20 generations', 'Queue up to 20 generations'],
      ['Unlimited* Image Generation', false, false, 'Supported models: Lucid Origin, Lucid Realism, Phoenix 1.0, Phoenix 0.9, FLUX Dev, FLUX Schnell', 'Supported models: Lucid Origin, Lucid Realism, Phoenix 1.0, Phoenix 0.9, FLUX Dev, FLUX Schnell', 'Supported models: Lucid Origin, Lucid Realism, Phoenix 1.0, Phoenix 0.9, FLUX Dev, FLUX Schnell'],
      ['Unlimited* Video Generation', false, false, false, 'Supported models: Motion 2.0, Motion 2.0 Fast', 'Supported models: Motion 2.0, Motion 2.0 Fast'],
      ['Unlimited* Concurrency', false, false, 'up to 1', 'up to 1', 'up to 1'],
      ['Unlimited* Image Queue', false, false, 'up to 5', 'up to 5', 'up to 5'],
      ['Unlimited* Video Queue', false, false, false, 'up to 20', 'up to 20'],
      ['Blueprints Concurrency', '1', '2', '3', '6', '6'],
      ['Blueprints Queue', '5', '5', '10', '20', '20'],
    ],
  },
  {
    title: 'Creative Features',
    icon: Sparkles,
    rows: [
      ['Image Generation', true, true, 'Unlimited*', 'Unlimited*', 'Unlimited*'],
      ['Video Generation', true, true, true, 'Unlimited*', 'Unlimited*'],
      ['Blueprints', 'Limited', true, true, true, true],
      ['Flow State', true, true, true, true, true],
      ['Ultra Quality', 'Limited', true, true, 'Unlimited*', 'Unlimited*'],
      ['Reference', 'Limited', 'Add up to 6 reference images', 'Add up to 6 reference images', 'Add up to 6 reference images', 'Add up to 6 reference images'],
      ['Video Guidance', 'Limited', true, true, true, true],
      ['Realtime Canvas', 'Limited', true, true, true, true],
      ['Realtime Generation', 'Limited', true, true, true, true],
      ['Presets', true, true, true, true, true],
      ['Elements', 'Limited', true, true, true, true],
      ['Platform Models', true, true, true, true, true],
      ['Third-party Models', true, true, true, true, true],
    ],
  },
  {
    title: 'Workflow & Management',
    icon: BriefcaseBusiness,
    rows: [
      ['Model Training', false, 'Train up to 10 AI models per month', 'Train up to 20 AI models per month', 'Train up to 50 AI models per month', 'Leverage your IP with Shared Models'],
      ['Private Generations', false, true, true, true, true],
      ['Collections', 'Limited', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited Shared Collections'],
    ],
  },
];

const FAQS = [
  ['What makes Lumina.AI different?', 'Lumina combines image, video, audio, 3D, Flow State and production workflows in one creative workspace, with one subscription across supported platforms.'],
  ['How do models work?', 'Each model is tuned for a different visual style or workflow. Choose a model in the creation studio, then refine the prompt and settings for the result you need.'],
  ['Will I own the images I make?', 'You retain the rights to the content you create, subject to the applicable plan terms and any third-party rights contained in your inputs.'],
  ['Tokens and Token Rollover at Lumina.AI', 'Fast Tokens are used for priority generations. Paid plans include a Token Bank that allows unused monthly tokens to roll over up to the plan limit.'],
  ['What happens if I run out of tokens in my paid plan?', 'You can continue with eligible relaxed generations, purchase Top-up Tokens, or wait for the next monthly token allocation.'],
  ['What is Token Rollover and How Does it Work?', 'Unused Fast Tokens move into your Token Bank at the end of a billing cycle until the maximum balance for your plan is reached.'],
  ['How do the "Unlimited" Plans and "Relaxed Generation" work?', 'Unlimited relaxed generation is available for selected models. During busy periods, relaxed jobs may queue longer to keep access fair and stable.'],
  ['How does Unlimited Video Generation work?', 'Ultimate and Teams plans can use relaxed video generation on supported models, with queue and concurrency limits shown in the comparison table.'],
  ['Why does Video use more tokens?', 'Video generation processes many frames and temporal motion information, so it requires more compute than a single still image.'],
  ['Can I use my generated images for commercial projects?', 'Yes. Paid plans support commercial creative work, subject to the terms of service and the rights attached to any source material you upload.'],
  ['Can I change my plan later?', 'Yes. You can upgrade, downgrade, or change the billing period from your account settings.'],
  ['Does the pricing include tax?', 'Displayed prices exclude applicable taxes. The final amount is calculated from your billing location at checkout.'],
  ['Will I be able to use my plan for API access?', 'Creator subscriptions and API usage are billed separately. Visit the API section for current access and token options.'],
  ['Can I buy more tokens if I run out?', 'Yes. Eligible paid plans can purchase Top-up Tokens without changing the base subscription.'],
];

function ComparisonValue({ value }) {
  if (value === true) return <Check className="plans-check" size={18} />;
  if (value === false) return <X className="plans-x" size={18} />;
  return <span>{value}</span>;
}

function PlanCard({ plan, yearly, onChoose }) {
  const price = yearly ? plan.yearly : plan.monthly;
  const oldPrice = yearly ? plan.oldYearly : plan.oldMonthly;

  return (
    <article className={`plans-card ${plan.best ? 'is-best' : ''}`}>
      {plan.best && <div className="plans-best-label">Best Offer</div>}
      <h2 style={{ color: plan.color }}>{plan.name}</h2>

      {plan.team ? (
        <Users className="plans-team-icon" size={54} />
      ) : (
        <div className="plans-price">
          {oldPrice != null && <del>${oldPrice}</del>}
          <strong>${price}</strong>
          <span>/ month</span>
          {price > 0 && <small>ex. tax.</small>}
        </div>
      )}

      {!plan.id.includes('free') && (
        <button
          type="button"
          className={`plans-subscribe ${plan.team ? 'is-team' : ''}`}
          onClick={() => onChoose(plan)}
        >
          {plan.team ? 'Get Started Now' : 'Subscribe'}
        </button>
      )}

      <div className="plans-perfect">
        <span>Perfect for</span>
        <strong>{plan.description}</strong>
        {plan.extra && <small>{plan.extra}</small>}
      </div>

      <ul>
        {plan.features.map((feature) => (
          <li key={feature}><CheckCircle2 size={13} /> <span>{feature}</span></li>
        ))}
      </ul>
    </article>
  );
}

export default function PlansView({ onBack }) {
  const [yearly, setYearly] = useState(true);
  const [chosenPlan, setChosenPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="plans-view">
      <button type="button" className="plans-back" onClick={onBack} aria-label="Back to home">
        <ArrowLeft size={18} />
      </button>

      <main>
        <section className="plans-hero">
          <h1>UNLOCK THE POWER OF<br />LUMINA.AI</h1>
          <p>
            One subscription, all platforms
            <Monitor size={18} />
            <Smartphone size={17} />
            <Bot size={17} />
            <Apple size={18} />
          </p>

          <div className="plans-billing" aria-label="Billing period">
            <button type="button" className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
              Pay Yearly <small>Up to 20% off</small>
            </button>
            <button type="button" className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>
              Pay Monthly
            </button>
          </div>

          <div className="plans-grid">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} yearly={yearly} onChoose={setChosenPlan} />
            ))}
          </div>
        </section>

        <section className="plans-comparison" aria-label="Plan comparison">
          <div className="plans-comparison-head">
            <h2>Compare all benefits</h2>
            {PLANS.map((plan) => (
              <div key={plan.id} className={plan.best ? 'is-best' : ''}>
                {plan.best && <small>Best Offer</small>}
                <strong>{plan.tableName}</strong>
                {plan.id !== 'free' && (
                  <button type="button" onClick={() => setChosenPlan(plan)}>
                    {plan.team ? 'Get started now' : 'Subscribe'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="plans-table">
            {COMPARISON_SECTIONS.map(({ title, icon: Icon, rows }) => (
              <section className="plans-table-section" key={title}>
                <h3><Icon size={18} /> {title}</h3>
                {rows.map(([label, ...values]) => (
                  <div className="plans-table-row" key={label}>
                    <strong>{label}<CircleHelp size={12} /></strong>
                    {values.map((value, index) => (
                      <div key={`${label}-${PLANS[index].id}`}>
                        <ComparisonValue value={value} />
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </section>

        <aside className="plans-note">
          * Unlimited relaxed generations apply only to image generation and video generation using selected models. Depending on the plan you are on, supported models currently include Lucid Origin, Lucid Realism, Phoenix 1.0, Phoenix 0.9, FLUX Dev, FLUX Schnell, Motion 2.0, Hailuo 2.3 and Wan 2.6. Concurrency and queuing may be slowed from time to time based on demand to ensure fair and equitable access and stability for other users.
        </aside>

        <section className="plans-faq">
          <h2>LUMINA FAQ’S</h2>
          <div>
            {FAQS.map(([question, answer], index) => {
              const open = openFaq === index;
              return (
                <article key={question} className={open ? 'is-open' : ''}>
                  <button type="button" onClick={() => setOpenFaq(open ? null : index)} aria-expanded={open}>
                    <strong>{question}</strong>
                    <ChevronDown size={15} />
                  </button>
                  {open && <p>{answer}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <button type="button" className="plans-chat" aria-label="Open help chat">
        <MessageSquare size={19} />
      </button>

      {chosenPlan && (
        <div className="plans-modal-backdrop" role="presentation" onMouseDown={() => setChosenPlan(null)}>
          <section
            className="plans-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${chosenPlan.tableName} plan selected`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="plans-modal-close" onClick={() => setChosenPlan(null)} aria-label="Close plan dialog">
              <X size={17} />
            </button>
            <span><Sparkles size={20} /></span>
            <h2>{chosenPlan.tableName}</h2>
            <p>
              {chosenPlan.team
                ? 'Your team workspace is ready to be configured.'
                : `${yearly ? 'Yearly' : 'Monthly'} billing at $${yearly ? chosenPlan.yearly : chosenPlan.monthly} per month, excluding tax.`}
            </p>
            <button type="button" onClick={() => setChosenPlan(null)}>Continue</button>
          </section>
        </div>
      )}
    </div>
  );
}
