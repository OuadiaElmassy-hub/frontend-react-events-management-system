import React from "react";
import { HashLink as Link } from 'react-router-hash-link';

const FOOTER_DATA = {
   sections: [
      {
         title: "Découvrir",
         links: [
            { name: "Tous les événements", to: "/events#list" },
            { name: "Festivals & Culture", to: "/events?category=culturel" },
            { name: "Randonnées & Nature", to: "/events?category=nature" },
            { name: "Expositions & Arts", to: "/events?category=art" },
         ],
      },
      {
         title: "Rovista",
         links: [
            { name: "À propos de nous", to: "/#about" },
            { name: "Devenir Organisateur", to: "/organisateurs" },
            { name: "Contactez-nous", to: "/#contact" },
            { name: "FAQ / Aide", to: "/aide" },
         ],
      },
      {
         title: "Légal",
         links: [
            { name: "Conditions Générales", to: "/conditions-utilisation" },
            { name: "Politique de Confidentialité", to: "/confidentialite" },
            { name: "Gestion des Cookies", to: "/cookies" },
         ],
      },
   ],
   socials: [
      {
         label: "Facebook",
         href: "#",
         viewBox: "0 0 155.139 155.139",
         path: "M89.584 155.139V84.378h23.742l3.562-27.585H89.584V39.184c0-7.984 2.208-13.425 13.67-13.425l14.595-.006V1.08C115.325.752 106.661 0 96.577 0 75.52 0 61.104 12.853 61.104 36.452v20.341H37.29v27.585h23.814v70.761z",
      },
      {
         label: "LinkedIn",
         href: "#",
         viewBox: "0 0 24 24",
         path: "M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 0 0 2.882 0",
      },
      {
         label: "X",
         href: "#",
         viewBox: "0 0 1226.37 1226.37",
         path: "M727.348 519.284 1174.075 0h-105.86L680.322 450.887 370.513 0H13.185l468.492 681.821L13.185 1226.37h105.866l409.625-476.152 327.181 476.152h357.328L727.322 519.284zM582.35 687.828l-47.468-67.894-377.686-540.24H319.8l304.797 435.991 47.468 67.894 396.2 566.721H905.661L582.35 687.854z",
      },
   ],
};

export default function Footer() {
   return (
      <footer className="bg-slate-950 pt-16 pb-8 px-4 md:px-8 border-t border-slate-900">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6 sm:gap-x-8">

               {/* Sections de liens internes */}
               {FOOTER_DATA.sections.map((section) => (
                  <div key={section.title} className="space-y-6">
                     <h3 className="text-sm text-slate-200 font-semibold uppercase tracking-wider">{section.title}</h3>
                     <ul className="space-y-4 text-sm text-slate-400 font-normal">
                        {section.links.map((link) => (
                           <li key={link.name}>
                              <Link
                                 to={link.to}
                                 smooth
                                 className="hover:text-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
                              >
                                 {link.name}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </div>
               ))}

               {/* Section Réseaux Sociaux & Newsletter */}
               <div className="space-y-6">
                  <h3 className="text-sm text-slate-200 font-semibold uppercase tracking-wider">Suivez-nous</h3>
                  <ul className="flex flex-wrap gap-4">
                     {FOOTER_DATA.socials.map((social) => (
                        <li key={social.label}>
                           <a
                              href={social.href}
                              className="flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-400/30 w-9 h-9 p-2.5 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              aria-label={social.label}
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 className="size-full fill-current"
                                 viewBox={social.viewBox}
                                 aria-hidden="true"
                              >
                                 <path d={social.path} />
                              </svg>
                           </a>
                        </li>
                     ))}
                  </ul>

                  <div className="!mt-8">
                     <h6 className="text-sm text-slate-300 font-medium">Newsletter Rovista</h6>
                     <p className="text-xs text-slate-400 mt-1">Recevez les meilleurs événements culturels et touristiques du Maroc.</p>
                     <div className="mt-4">
                        <Link
                           to="/auth"
                           className="py-2.5 px-4 text-xs rounded-xl font-bold inline-block cursor-pointer tracking-wide text-white bg-[#D97706] hover:bg-[#C2410C] transition-all shadow-md shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                           S'inscrire gratuitement
                        </Link>
                     </div>
                  </div>
               </div>
            </div>

            <hr className="my-8 border-slate-900" />

            <div className="text-center">
               <p className="text-slate-500 text-xs">
                  &copy; {new Date().getFullYear()} Rovista. Tous droits réservés. Plateforme marocaine des événements et du tourisme.
               </p>
            </div>
         </div>
      </footer>
   );
}