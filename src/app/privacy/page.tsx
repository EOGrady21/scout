import Link from "next/link";

export const metadata = {
  title: "Scout Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Scout&apos;s Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated March 31, 2026</p>

      <div className="space-y-6 text-sm leading-7">
        <p>
          This document will outline how Scout collects data from users, what data is collected
          from users, where it is stored, how we use it, who we share it with, and where it is
          stored. We truly value your privacy and if you have any questions while reading this
          document we strongly encourage you to contact us - the creators of Scout can be
          contacted by messaging on GitHub.
        </p>

        <p>
          As creators of this application we understand the seriousness of handling your data and
          we are committed to ensuring we handle your data in accordance with Canadian privacy laws
          and explicitly for purposes outlined in this document.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2">What Information Do We Collect?</h2>
          <p>
            When you sign up for Scout your Gmail account is used, by signing up with this email
            we collect your name and email address. The technical data we collect when you use
            Scout includes your IP address, your browser type, and other usage data obtained
            through cookies/similar products.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Consent</h2>
          <p>
            By using Scout you are consenting to the collection and use of your data as outlined
            in this document. You are also consenting to receive emails from Scout, if at any time
            you wish to revoke this consent please click the &quot;Unsubscribe&quot; button in the email or
            contact us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Why Do We Collect This Data?</h2>
          <p>
            We collect this data to monitor website usage, to communicate with our users regarding
            site updates and your account, to improve and maintain our site, for marketing
            analytics, and for security/proper usage of our website. If your data is shared with
            one of our partners only the information absolutely necessary will be shared.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">How is Data Stored and Retained?</h2>
          <p>
            Your data is retained only for as long as we require it as stated by Canadian law.
            Your data may be held in or outside of Canada but we will take the precautions to
            ensure it is treated securely and that your privacy is protected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">What Security Do We Enforce?</h2>
          <p>
            We keep our secrets and tokens secure and are only handled by a limited number of
            individuals. This application is crowdsourced but your information will not be
            accessible to all contributors of the application. If your data is compromised we will
            let you know as soon as possible via email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Your Access To Your Data</h2>
          <p>
            If you have any questions on what data and personal information we have for you, how
            it is used and where it is stored please contact us via GitHub. Additionally, if you
            would like your data and personal information deleted from Scout please message us and
            submit an issue on our GitHub page and we will promptly address it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Changes To This Policy</h2>
          <p>
            As our product grows and evolves these policies may change and evolve. As they evolve
            we want to assure you that your privacy and information security are very important to
            Scout and that any changes to this policy will reflect Canadian law and Scout&apos;s
            values. Please check this file at any time to see any updates or changes. By using
            this Scout&apos;s website you are consenting to the storage, usage, email consent and
            acceptance of this privacy policy.
          </p>
        </section>

        <p>
          Finally, we would like to encourage you again to reach out to us if you have any
          questions, or concerns via GitHub. Happy Scouting!
        </p>

        <p>
          Contact us: {" "}
          <a
            href="https://github.com/EOGrady21/scout/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-scout-green hover:text-scout-dark transition-colors"
          >
            GitHub Issues
          </a>
          {" "}or go back {" "}
          <Link href="/" className="underline text-scout-green hover:text-scout-dark transition-colors">
            Home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}