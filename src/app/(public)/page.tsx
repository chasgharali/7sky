import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <>
      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(1.05) saturate(1.1)" }}
        >
          <source src="/media/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Base darkening layer */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Directional top-to-bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
        {/* Directional left-to-right gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
          {/* Available badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/40 backdrop-blur-sm animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c9a227] animate-pulse-gold flex-shrink-0" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#c9a227]">
              Now Available – G-14 Markaz, Islamabad
            </span>
          </div>

          {/* 7Sky logo – large splash */}
          <div className="mb-6 animate-fade-in delay-100">
            <Image
              src="/media/logos/7sky-logo.png"
              alt="7Sky"
              width={300}
              height={110}
              className="mx-auto h-24 sm:h-28 w-auto drop-shadow-2xl"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 animate-fade-in-up delay-200">
            Shops &amp; Offices{" "}
            <span className="gradient-text-gold">for Sale</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90">
              in G-14 Markaz, Islamabad
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Premium commercial shops and offices for sale on easy installments by{" "}
            <span className="text-[#c9a227] font-semibold">One Capital Builders</span>
            {" "}— the future landmark of G-14 Markaz, Islamabad.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up delay-400">
            <Link href="/floor-plan" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Floor Plan
            </Link>
            <Link href="/floor-plan#availability" className="btn-ghost">
              Check Availability
            </Link>
            <Link href="/verify-ownership" className="btn-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Ownership
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-scroll-bounce">
          <span className="text-xs text-white/70 tracking-widest uppercase font-medium">Scroll</span>
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="bg-[#0d0d0d] border-y border-white/5 relative">
        {/* Gold shimmer bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {[
              { num: "7",    label: "Total Floors",     sub: "LGF to 5th" },
              { num: "3",    label: "Sides Open",       sub: "Prime corner plot" },
              { num: "G-14", label: "Markaz Location",  sub: "Islamabad" },
              { num: "100+", label: "Commercial Units", sub: "Shops & offices for sale" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-6 group hover:bg-white/[0.02] transition-colors">
                <div className="w-1 h-12 bg-gradient-to-b from-[#c9a227] to-transparent rounded-full flex-shrink-0" />
                <div>
                  <p className="text-3xl font-black text-white font-display leading-none">{stat.num}</p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">{stat.label}</p>
                  <p className="text-xs text-gray-600">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT ONE CAPITAL BUILDERS
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="section-label mb-4">About the Developer</div>
              <div className="gold-divider mb-6" />
              <div className="mb-6">
                <Image
                  src="/media/logos/one-capital-logo.png"
                  alt="One Capital Builders"
                  width={180}
                  height={90}
                  className="h-14 w-auto"
                />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Building{" "}
                <span className="gradient-text-gold">Confidence</span>,<br />
                Reliability & Lasting Value
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                One Capital Builders is the result of a powerful partnership between two seasoned
                builders, combining decades of experience in commercial, residential, and
                hospitality projects. Our focus is simple: quality without compromise,
                delivery without delays, and trust without exceptions.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                We approach every project with a long-term vision, ensuring sustainable value
                for investors and occupants alike.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Our flagship project, 7Sky, offers premium shops and offices for sale in G-14
                Markaz, Islamabad on easy installment plans — making commercial property
                investment accessible and hassle-free.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "⏱", title: "Timely Completion",    desc: "Delivered on schedule" },
                  { icon: "🏗", title: "Superior Quality",     desc: "High-grade materials" },
                  { icon: "🔧", title: "Reliable Maintenance", desc: "Post-completion support" },
                  { icon: "📋", title: "Smooth Ownership",     desc: "Transparent documentation" },
                ].map((feat, i) => (
                  <div key={i} className="glass-card p-4 rounded-xl hover-lift hover-gold-border">
                    <span className="text-xl mb-2 block">{feat.icon}</span>
                    <p className="text-sm font-semibold text-white">{feat.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image grid */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#2563eb]/10 to-[#c9a227]/10 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-3">
                <div className="col-span-2 aspect-[16/9] relative rounded-2xl overflow-hidden border border-white/10">
                  <Image
                    src="/media/gallery/01.jpeg"
                    alt="7Sky Commercial Plaza G-14 Markaz Islamabad – Shops and Offices for Sale"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/media/gallery/02.jpeg"
                    alt="Shop for Sale in G-14 Markaz Islamabad – 7Sky Plaza"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/media/gallery/03.jpeg"
                    alt="Office for Sale in G-14 Islamabad – 7Sky Commercial Plaza"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass-card-gold rounded-2xl p-4 text-center min-w-[120px] shadow-xl">
                <p className="text-2xl font-black gradient-text-gold font-display">2029</p>
                <p className="text-xs text-gray-400 font-medium">Completion Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROJECT FLOORS / FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">7Sky Commercial Plaza</div>
            <div className="gold-divider mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Commercial Shops &amp; Offices{" "}
              <span className="gradient-text-blue">for Sale in G-14 Markaz</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              7 floors of premium commercial property for sale in G-14 Markaz, Islamabad —
              designed for maximum utility, visibility, and long-term investment value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                floor: "Lower Ground",
                abbr: "LGF",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: "Retail Shops for Sale – High Footfall",
                desc: "Shops for sale in G-14 Markaz ideal for retail chains, supermarkets, food courts, and high-traffic businesses. Available on installment.",
                color: "from-blue-600/20 to-blue-900/10",
                border: "border-blue-500/20",
              },
              {
                floor: "Ground Floor",
                abbr: "GF",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: "Premium Shops for Sale in G-14 Markaz",
                desc: "Street-facing premium shops for sale in G-14 Markaz Islamabad with maximum frontage, visibility, and three-side access.",
                color: "from-amber-600/20 to-amber-900/10",
                border: "border-amber-500/20",
                featured: true,
              },
              {
                floor: "1st – 5th Floor",
                abbr: "1–5F",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Executive Offices for Sale in G-14 Islamabad",
                desc: "Purpose-built offices for sale in G-14 Islamabad for IT firms, consultants, corporate setups, and professional services. Easy installment plans available.",
                color: "from-purple-600/20 to-purple-900/10",
                border: "border-purple-500/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-7 hover-lift group overflow-hidden`}
              >
                {item.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4 text-gray-300 group-hover:text-[#c9a227] transition-colors">
                  {item.icon}
                </div>
                <div className="text-3xl font-black gradient-text-gold font-display mb-1">{item.abbr}</div>
                <p className="text-xs text-gray-500 mb-3">{item.floor}</p>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                <div className="mt-6">
                  <Link
                    href="/floor-plan"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a227] hover:gap-2.5 transition-all"
                  >
                    View Units
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY INVEST
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0a0a0a] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "radial-gradient(circle, #c9a227 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">Investment Opportunity</div>
            <div className="gold-divider mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Invest in Commercial Property in{" "}
              <span className="gradient-text-gold">G-14 Islamabad</span>?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Buy shops or offices for sale in G-14 Markaz at 7Sky — a quality-built
              commercial plaza offering strong rental yields and long-term appreciation in Islamabad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "On-Time Delivery",
                desc: "Strict timelines and transparent project milestones ensure delivery as promised.",
                accentColor: "text-blue-400",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: "Superior Quality",
                desc: "High-grade materials, modern structural standards and reliable safety systems.",
                accentColor: "text-green-400",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure Ownership",
                desc: "Transparent legal documentation, smooth ownership transfer, and verified records.",
                accentColor: "text-amber-400",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "High Rental Yield",
                desc: "G-14 Markaz's growing commercial activity ensures strong rental income and resale value.",
                accentColor: "text-purple-400",
              },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 hover-lift hover-gold-border group">
                <div className={`mb-4 ${item.accentColor}`}>{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GALLERY – Bento grid
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-4">Project Gallery</div>
            <div className="gold-divider mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              A Glimpse of <span className="gradient-text-blue">7Sky</span>
            </h2>
          </div>

          {/* Row 1 — hero left (tall) + 2 stacked right */}
          <div className="grid md:grid-cols-3 gap-2 mb-2">
            <div className="md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto relative rounded-xl overflow-hidden group">
              <Image
                src="/media/gallery/04.jpeg"
                alt="7Sky Commercial Plaza Aerial View – Shops for Sale in G-14 Markaz Islamabad"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded">Aerial Render</span>
              </div>
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden group">
              <Image
                src="/media/gallery/05.jpeg"
                alt="7Sky Plaza Side View – Commercial Property for Sale in G-14 Islamabad"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded">Side View</span>
              </div>
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden group">
              <Image
                src="/media/gallery/06.jpeg"
                alt="7Sky Plaza Night Render – Offices for Sale in G-14 Markaz Islamabad"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded">Night Render</span>
              </div>
            </div>
          </div>

          {/* Row 2 — 3 equal columns */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { src: "/media/gallery/01.jpeg", label: "Front Elevation", alt: "7Sky Plaza Front Elevation – Shop for Sale in G-14 Markaz" },
              { src: "/media/gallery/02.jpeg", label: "Street View", alt: "7Sky Plaza Street View – Office for Sale in G-14 Islamabad" },
              { src: "/media/gallery/03.jpeg", label: "Evening Render", alt: "7Sky Plaza Evening Render – Commercial Property G-14 Markaz Islamabad" },
            ].map((img, i) => (
              <div key={i} className="aspect-[4/3] relative rounded-xl overflow-hidden group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm rounded">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LOCATION / GOOGLE MAPS
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">Location</div>
            <div className="gold-divider mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Prime Commercial Property Location –{" "}
              <span className="gradient-text-gold">G-14 Markaz Islamabad</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              7Sky is positioned on a prime three-side open plot in G-14 Markaz, Islamabad —
              with easy access, high visibility, and proximity to major brands, banks, and
              residential sectors. Buy a shop or office for sale in one of Islamabad&apos;s
              fastest-growing commercial hubs.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
            {/* Exact coordinates from Google Maps link */}
            <iframe
              src="https://maps.google.com/maps?q=33.641804,72.9425409&output=embed&z=17"
              className="w-full h-[480px] border-0"
              loading="lazy"
              title="7Sky Location – G-14 Markaz Islamabad"
              allowFullScreen
            />

            {/* Address overlay card */}
            <div className="absolute bottom-6 left-6 glass-card-gold rounded-2xl p-5 max-w-xs shadow-xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#c9a227] flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.843-5.139 3.843-9.077a8.14 8.14 0 10-16.278 0c0 3.938 1.9 6.998 3.843 9.077a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.143.742zM12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#c9a227] mb-1">7Sky Commercial Plaza</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    G-14 Markaz, Islamabad<br />
                    Pakistan
                  </p>
                  <a
                    href="https://www.google.com/maps/place/33%C2%B038'30.5%22N+72%C2%B056'33.2%22E/@33.641804,72.942541,16z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#c9a227] hover:underline mt-2"
                  >
                    Open in Google Maps
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location highlights */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { icon: "🛣", text: "Easy access from main roads and surrounding sectors including G-13, G-15, and I-sectors" },
              { icon: "🏪", text: "Proximity to major brands, restaurants, banks & retail chains in G-14 Markaz" },
              { icon: "📈", text: "Strong future appreciation — commercial property for sale in G-14 Markaz is in high demand" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 glass-card rounded-xl p-4 hover-gold-border">
                <span className="text-xl mt-0.5 flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/8 via-transparent to-[#c9a227]/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent" />

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="section-label justify-center mb-4">Get Started</div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Book Your Shop or Office{" "}
            <span className="gradient-text-gold">on Installment</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Limited shops and offices for sale in G-14 Markaz, Islamabad. Easy installment
            plans available with 25% down payment. View the floor plan, check availability,
            or contact us today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/floor-plan" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Floor Plan
            </Link>
            <Link href="/verify-ownership" className="btn-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Ownership
            </Link>
            <a
              href="https://api.whatsapp.com/send/?phone=923347444432&text=Hi+Team%2C+I%27m+interested+in+7Sky.+Please+share+details.&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Inquiry
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">Frequently Asked Questions</div>
            <div className="gold-divider mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Shops &amp; Offices for Sale –{" "}
              <span className="gradient-text-gold">FAQs</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Are shops available for sale in G-14 Markaz Islamabad?",
                a: "Yes, 7Sky commercial plaza offers premium shops for sale in G-14 Markaz, Islamabad across the Lower Ground Floor and Ground Floor. Both street-facing and interior shops are available with flexible payment plans.",
              },
              {
                q: "Can I buy a shop or office on installment at 7Sky?",
                a: "Absolutely. 7Sky offers easy installment plans with just 25% down payment, 55% in quarterly installments over 3.5 years, and 20% on possession. This makes buying a shop or office for sale in G-14 Islamabad accessible to all investors.",
              },
              {
                q: "What is the payment plan for offices at 7Sky G-14?",
                a: "Executive offices for sale at 7Sky G-14 Markaz follow a structured 3.5-year installment plan: 25% down payment on booking, 14 quarterly installments covering 55%, and 20% due at possession. Visit our payment plan page for detailed pricing.",
              },
              {
                q: "What types of commercial property are for sale at 7Sky?",
                a: "7Sky offers two types of commercial property for sale in G-14 Markaz Islamabad: retail shops (Lower Ground and Ground Floor) ideal for businesses with high foot traffic, and executive office spaces (1st to 5th Floor) designed for IT firms, consultants, and corporate setups.",
              },
              {
                q: "Is G-14 Markaz a good location for commercial investment in Islamabad?",
                a: "G-14 Markaz is one of Islamabad's fastest-developing commercial sectors. With increasing footfall, proximity to major brands, banks, restaurants, and residential areas like G-13 and G-15, commercial property for sale in G-14 offers strong rental yields and long-term appreciation.",
              },
              {
                q: "How do I book a shop for sale in G-14 Markaz Islamabad at 7Sky?",
                a: "You can book a shop or office for sale at 7Sky by viewing our interactive floor plan, selecting an available unit, and submitting a booking request. Alternatively, contact our sales team via WhatsApp for immediate assistance.",
              },
            ].map((faq, i) => (
              <details key={i} className="group glass-card rounded-2xl border border-white/10 overflow-hidden hover-gold-border">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <h3 className="text-sm sm:text-base font-semibold text-white group-open:text-[#c9a227] transition-colors">
                    {faq.q}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 -mt-2">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Are shops available for sale in G-14 Markaz Islamabad?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, 7Sky commercial plaza offers premium shops for sale in G-14 Markaz, Islamabad across the Lower Ground Floor and Ground Floor. Both street-facing and interior shops are available with flexible payment plans.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I buy a shop or office on installment at 7Sky?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. 7Sky offers easy installment plans with just 25% down payment, 55% in quarterly installments over 3.5 years, and 20% on possession. This makes buying a shop or office for sale in G-14 Islamabad accessible to all investors.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the payment plan for offices at 7Sky G-14?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Executive offices for sale at 7Sky G-14 Markaz follow a structured 3.5-year installment plan: 25% down payment on booking, 14 quarterly installments covering 55%, and 20% due at possession.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What types of commercial property are for sale at 7Sky?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "7Sky offers two types of commercial property for sale in G-14 Markaz Islamabad: retail shops (Lower Ground and Ground Floor) and executive office spaces (1st to 5th Floor) designed for IT firms, consultants, and corporate setups.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is G-14 Markaz a good location for commercial investment in Islamabad?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "G-14 Markaz is one of Islamabad's fastest-developing commercial sectors. With increasing footfall, proximity to major brands, banks, restaurants, and residential areas, commercial property for sale in G-14 offers strong rental yields and long-term appreciation.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I book a shop for sale in G-14 Markaz Islamabad at 7Sky?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can book a shop or office for sale at 7Sky by viewing the interactive floor plan, selecting an available unit, and submitting a booking request. Alternatively, contact the sales team via WhatsApp for immediate assistance.",
                  },
                },
              ],
            }),
          }}
        />
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-black border-t border-white/8">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/media/logos/one-capital-logo.png"
                  alt="One Capital Builders – Real Estate Developer Islamabad"
                  width={130}
                  height={50}
                  className="h-11 w-auto"
                />
                <span className="w-px h-8 bg-[#c9a227]/30" />
                <Image
                  src="/media/logos/7sky-logo.png"
                  alt="7Sky – Shops and Offices for Sale in G-14 Markaz Islamabad"
                  width={80}
                  height={30}
                  className="h-8 w-auto opacity-90"
                />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Premium shops and offices for sale in G-14 Markaz, Islamabad on easy installments.
                7Sky commercial plaza by One Capital Builders — the future landmark of G 14 Markaz.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227] mb-4">
                Quick Links
              </p>
              <nav className="space-y-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About Us" },
                  { href: "/floor-plan", label: "Floor Plan" },
                  { href: "/payment-plan", label: "Payment Plan" },
                  { href: "/verify-ownership", label: "Verify Ownership" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block text-gray-500 hover:text-[#c9a227] text-sm transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227] mb-4">
                Location
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.843-5.139 3.843-9.077a8.14 8.14 0 10-16.278 0c0 3.938 1.9 6.998 3.843 9.077a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.143.742zM12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                  <span>G-14 Markaz, Islamabad, Pakistan</span>
                </div>
                <a
                  href="https://api.whatsapp.com/send/?phone=923347444432&text=Hi+Team%2C+I%27m+interested+in+7Sky.+Please+share+details.&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#25D366] hover:text-[#1ebe57] transition font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} 7Sky – One Capital Builders. All rights reserved.</p>
            <Link href="/admin/login" className="hover:text-gray-400 transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
