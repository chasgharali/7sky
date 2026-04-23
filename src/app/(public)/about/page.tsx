import Image from "next/image";

export const metadata = {
  title: "About One Capital Builders | Shops & Offices for Sale in G-14 Islamabad",
  description:
    "One Capital Builders – premier real estate developer in Islamabad. Buy shops & offices for sale in G-14 Markaz on easy installments at 7Sky commercial plaza.",
};

export default function AboutPage() {
  return (
    <div className="public-page py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Image
          src="/ONE%20CAPITAL%20NEW%20BLACK%20FONT.png"
          alt="One Capital Builders – Real Estate Developer in Islamabad"
          width={200}
          height={100}
          className="mb-8"
        />
        <h1 className="text-3xl font-bold text-white mb-6">
          About One Capital Builders – Real Estate Developer in Islamabad
        </h1>
        <div className="prose max-w-none space-y-6 text-gray-400">
          <p>
            One Capital Builders is the result of a powerful partnership between
            two seasoned builders, combining decades of experience in
            commercial, residential, and hospitality projects. This first
            collaboration is only the beginning of a series of thoughtfully
            planned developments. Our focus is simple: quality without compromise,
            delivery without delays, and trust without exceptions. We approach
            every project with a long-term vision, ensuring sustainable value
            for investors and occupants alike.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8">What Sets Us Apart</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Timely project completion</li>
            <li>Superior construction quality</li>
            <li>Dependable maintenance services</li>
            <li>Seamless ownership transfer process</li>
          </ul>
          <p>
            At One Capital Builders, we don&apos;t just build structures — we
            build confidence, reliability, and lasting value.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            7Sky – Shops &amp; Offices for Sale in G-14 Markaz, Islamabad
          </h2>
          <p>
            7Sky is a thoughtfully planned, state-of-the-art commercial
            development by One Capital Builders, offering premium shops and
            offices for sale in G-14 Markaz, Islamabad. Strategically positioned
            on a prime three-side open plot, 7Sky enjoys exceptional visibility,
            accessibility, and long-term commercial value. This iconic project
            has been carefully conceptualized to meet the growing demand for
            modern retail shops and executive office spaces for sale in one of
            Islamabad&apos;s fastest-developing sectors.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Commercial Property for Sale in G-14 – Smartly Designed for Business
          </h2>
          <p>
            7Sky features a total of seven floors, offering a balanced mix of
            commercial shops and corporate office spaces for sale in G-14 Markaz:
            Lower Ground Floor – Shops for sale ideal for retail, services, and
            high-footfall businesses. Ground Floor – Premium shops for sale with
            maximum visibility. Five Upper Floors – Purpose-built executive
            offices for sale for corporate setups, IT firms, consultants, and
            professional services. Each floor is designed with efficient layouts,
            wide corridors, and optimal space utilization. All units are
            available on easy installment plans.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Prime Location – Why Buy Commercial Property in G-14 Markaz Islamabad
          </h2>
          <p>
            Located in G-14 Markaz, 7Sky benefits from: Easy access from main
            roads and surrounding sectors. Proximity to major brands,
            restaurants, banks, and retail chains. Strong future appreciation
            potential as the Markaz continues to develop. With increasing
            commercial activity in the area, buying a shop or office for sale
            in G-14 Markaz is one of the best commercial investments in Islamabad.
            7Sky is positioned to become a central business hub for G-13, G-14,
            and nearby sectors.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Built for Quality, Safety & Longevity
          </h2>
          <p>
            At One Capital Builders, quality is never compromised. 7Sky is being
            developed using: High-grade construction materials. Modern
            architectural and structural standards. Reliable electrical,
            plumbing, and safety systems. The project is engineered to ensure
            durability, functionality, and aesthetic appeal, making it a
            long-term asset for investors and businesses alike.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Buy on Easy Installments – Investor-Friendly Ownership
          </h2>
          <p>
            7Sky is designed with investors in mind, offering: On-time project
            completion. Transparent documentation and smooth ownership
            transfer. Reliable post-completion building maintenance. Strong
            rental and resale potential. With easy installment plans featuring
            25% down payment and quarterly installments, buying a shop or office
            for sale in G-14 Islamabad has never been easier. Whether
            you&apos;re looking to establish your business or secure a high-yield
            commercial investment in Islamabad, 7Sky offers peace of mind and
            lasting value.
          </p>

          <p className="mt-8 text-lg text-[#c9a227]">
            7Sky is more than just a building — it is a symbol of growth,
            trust, and modern development. With shops and offices for sale in
            G-14 Markaz on easy installments, prime location, intelligent planning,
            and commitment to excellence, 7Sky is set to become one of the most
            recognized commercial addresses in Islamabad.
          </p>
        </div>
      </div>
    </div>
  );
}
