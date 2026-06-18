// import React from "react";

// export default function ContactForm() {

//    return (
//       <section className="bg-gray-100 px-4 md:px-8 py-6">
//          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
//             <h2 className="text-3xl font-bold text-slate-900 mb-6 md:text-4xl">
//                Contact us
//             </h2>
//             <p className="text-base leading-relaxed text-slate-600">
//                Have a question, need support, or want to discuss your next project? We’re here to help.
//             </p>
//          </div>

//          <div className="max-w-3xl mx-auto">
//             <form
//                className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded-md shadow-xs border border-slate-300 md:p-8">
//                <div>
//                   <label htmlFor="name"
//                      className="mb-2 text-slate-900 font-medium text-sm inline-block">Name</label>
//                   <input type="text" id="name" name="name" placeholder="John doe"
//                      className="px-3 py-2.5 text-sm text-slate-900 w-full rounded-md bg-white outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
//                </div>
//                <div>
//                   <label htmlFor="email"
//                      className="mb-2 text-slate-900 font-medium text-sm inline-block">Email</label>
//                   <input type="email" id="email" name="email" placeholder="john@readymadeui.com"
//                      className="px-3 py-2.5 text-sm text-slate-900 w-full rounded-md bg-white outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
//                </div>
//                <div>
//                   <label htmlFor="phone" className="mb-2 text-slate-900 font-medium text-sm inline-block">Phone
//                      number</label>
//                   <input type="number" id="phone" name="phone" placeholder="+11800-259-854"
//                      className="px-3 py-2.5 text-sm text-slate-900 w-full rounded-md bg-white outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
//                </div>
//                <div>
//                   <label htmlFor="company"
//                      className="mb-2 text-slate-900 font-medium text-sm inline-block">Company</label>
//                   <input type="text" id="company" name="company" placeholder="XYZ pvt. ltd."
//                      className="px-3 py-2.5 text-sm text-slate-900 w-full rounded-md bg-white outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
//                </div>
//                <div className="col-span-full">
//                   <div>
//                      <label htmlFor="message"
//                         className="mb-2 text-slate-900 font-medium text-sm inline-block">Message</label>
//                      <textarea placeholder="Write message" rows="6" type="text" id="message" name="message"
//                         className="px-3 py-2.5 text-sm text-slate-900 w-full rounded-md bg-white outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"></textarea>
//                   </div>

//                   <button type="submit"
//                      className="mt-6 py-2.5 px-4 text-sm rounded-md font-semibold cursor-pointer text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Send
//                      message</button>
//                </div>
//             </form>

//             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
//                <div className="flex items-center flex-col text-center gap-4">
//                   <div
//                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-slate-200">
//                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5 fill-blue-700"
//                         viewBox="0 0 32 32">
//                         <path
//                            d="M26.69 7.8c-1.97-4.13-6.03-6.74-10.6-6.8C11.51.94 7.45 3.46 5.41 7.6c-2.12 4.29-1.62 9.26 1.32 12.99l7.59 9.64a2.024 2.024 0 0 0 3.18 0l7.79-9.9c2.83-3.6 3.36-8.39 1.4-12.52zm-2.96 11.29-7.83 9.9-7.59-9.64c-2.45-3.11-2.87-7.28-1.1-10.86 1.7-3.44 4.95-5.48 8.71-5.48h.15c3.86.06 7.16 2.17 8.82 5.66s1.23 7.38-1.16 10.42"
//                            data-original="#000000" />
//                         <path
//                            d="M15.91 7.16c-3.01 0-5.46 2.45-5.46 5.46s2.45 5.46 5.46 5.46 5.46-2.45 5.46-5.46-2.45-5.46-5.46-5.46m0 8.91a3.461 3.461 0 0 1 0-6.92 3.461 3.461 0 0 1 0 6.92"
//                            data-original="#000000" />
//                      </svg>
//                   </div>
//                   <div>
//                      <h3 className="text-slate-900 text-base font-semibold">Visit office</h3>
//                      <p className="text-sm text-slate-600 mt-1"> 123 Main Street, City, Country</p>
//                   </div>
//                </div>

//                <div className="flex items-center flex-col text-center gap-4">
//                   <div
//                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-slate-200">
//                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5 fill-blue-700"
//                         viewBox="0 0 32 32">
//                         <path
//                            d="M22.56 30a5.2 5.2 0 0 1-2-.41A34.53 34.53 0 0 1 2.4 11.42a5 5 0 0 1 1.06-5.51l3-3a3 3 0 0 1 4.24 0l3.53 3.53a3 3 0 0 1 0 4.24l-1.63 1.65a12.54 12.54 0 0 0 7.07 7.07l1.68-1.67a3 3 0 0 1 4.24 0l3.53 3.53a3 3 0 0 1 0 4.24l-3 3a5 5 0 0 1-3.56 1.5M8.62 4a1 1 0 0 0-.71.29l-3 3a3 3 0 0 0-.64 3.31 32.47 32.47 0 0 0 17.1 17.16 3 3 0 0 0 3.31-.64l3-3a1 1 0 0 0 0-1.42l-3.54-3.53a1 1 0 0 0-1.41 0l-2.12 2.12a1 1 0 0 1-1 .24 14.42 14.42 0 0 1-9.12-9.12 1 1 0 0 1 .24-1l2.12-2.12a1 1 0 0 0 .29-.71 1 1 0 0 0-.29-.7L9.33 4.29A1 1 0 0 0 8.62 4"
//                            data-original="#000000" />
//                      </svg>
//                   </div>
//                   <div>
//                      <h3 className="text-slate-900 text-base font-semibold">Call us</h3>
//                      <p className="text-sm text-slate-600 mt-1"> +158 996 888</p>
//                   </div>
//                </div>

//                <div className="flex items-center flex-col text-center gap-4">
//                   <div
//                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-slate-200">
//                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5 fill-blue-700"
//                         viewBox="0 0 24 24" aria-hidden="true">
//                         <path fillRule="evenodd"
//                            d="M.41 4.747A4.35 4.35 0 0 1 4.76.4h14.488a4.35 4.35 0 0 1 4.35 4.352l-.007 10.109a4.35 4.35 0 0 1-4.35 4.346H13.52a.3.3 0 0 0-.188.07l-4.548 3.84c-1.319 1.113-3.338.176-3.338-1.552v-2.068a.29.29 0 0 0-.29-.29h-.403a4.35 4.35 0 0 1-4.35-4.352zM4.76 2.14a2.61 2.61 0 0 0-2.61 2.608l-.008 10.108a2.61 2.61 0 0 0 2.61 2.611h.403c1.12 0 2.03.91 2.03 2.03v2.068a.29.29 0 0 0 .475.22l4.548-3.839a2.03 2.03 0 0 1 1.31-.479h5.723a2.61 2.61 0 0 0 2.61-2.608l.007-10.108a2.61 2.61 0 0 0-2.61-2.61zm2.128 5.29a.87.87 0 0 1 .87-.87h8.485a.87.87 0 0 1 0 1.74H7.757a.87.87 0 0 1-.87-.87zm0 4.744a.87.87 0 0 1 .87-.87h4.781a.87.87 0 0 1 0 1.74H7.758a.87.87 0 0 1-.87-.87"
//                            clipRule="evenodd" data-original="#000000" />
//                      </svg>
//                   </div>
//                   <div>
//                      <h3 className="text-slate-900 text-base font-semibold">Chat to us</h3>
//                      <p className="text-sm text-slate-600 mt-1">info@example.com</p>
//                   </div>
//                </div>

//             </div>
//          </div>
//       </section>
//    );
// }

import React from "react";

export default function ContactUs() {
   return (
      <section className="px-4 md:px-6 py-16 md:py-20 w-full">
         <div className="grid md:grid-cols-2 items-start gap-12 md:gap-16 mx-auto max-w-5xl">
            
            {/* Colonne Gauche : Infos textuelles */}
            <div>
               <div className="mb-12">
                  <h2 className="text-3xl font-bold text-white mb-6 md:text-4xl">
                     Contactez-nous
                  </h2>
                  <p className="text-base leading-relaxed text-blue-100/80">
                     Une question sur un événement, un problème avec votre réservation ou un partenariat en vue ? Notre équipe marocaine est là pour vous accompagner et rendre votre expérience fluide.
                  </p>
               </div>

               {/* Bloc Email */}
               <div className="mt-12">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Email</h3>
                  <ul className="mt-4">
                     <li className="flex items-center">
                        {/* Bulle d'icône adoucie avec opacité blanche */}
                        <div className="flex items-center justify-center bg-white/10 w-10 h-10 p-2.5 rounded-xl border border-white/10">
                           <svg xmlns="http://www.w3.org/2000/svg" className="fill-none text-orange-400 stroke-current"
                              viewBox="0 0 682.667 682.667" aria-hidden="true" width="20" height="20">
                              <g transform="matrix(1.33 0 0 -1.33 0 550)">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"
                                    d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z" />
                              </g>
                           </svg>
                        </div>
                        <div className="text-sm ml-4">
                           <small className="block text-blue-200/60 font-medium">Support AtlasEvents</small>
                           <span className="font-semibold text-orange-400 hover:underline cursor-pointer">support@atlasEvents.ma</span>
                        </div>
                     </li>
                  </ul>
               </div>

               {/* Réseaux Sociaux */}
               <div className="mt-12">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Suivez-nous</h3>
                  <ul className="flex flex-wrap gap-3 mt-4">
                     {[
                        { label: 'Facebook', path: 'M89.584 155.139V84.378h23.742l3.562-27.585H89.584V39.184c0-7.984 2.208-13.425 13.67-13.425l14.595-.006V1.08C115.325.752 106.661 0 96.577 0 75.52 0 61.104 12.853 61.104 36.452v20.341H37.29v27.585h23.814v70.761z', view: '0 0 155.139 155.139' },
                        { label: 'LinkedIn', path: 'M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 0 0 2.882 0', view: '0 0 24 24' },
                        { label: 'X', path: 'M727.348 519.284 1174.075 0h-105.86L680.322 450.887 370.513 0H13.185l468.492 681.821L13.185 1226.37h105.866l409.625-476.152 327.181 476.152h357.328L727.322 519.284zM582.35 687.828l-47.468-67.894-377.686-540.24H319.8l304.797 435.991 47.468 67.894 396.2 566.721H905.661L582.35 687.854z', view: '0 0 1226.37 1226.37' }
                     ].map((item) => (
                        <li key={item.label}>
                           <a href="#"
                              className="flex items-center justify-center bg-white/5 border border-white/10 w-9 h-9 p-2.5 rounded-xl text-blue-100 hover:text-orange-400 hover:bg-white/10 hover:border-orange-400/40 transition-all focus:outline-none"
                              aria-label={item.label}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="size-full fill-current"
                                 viewBox={item.view} aria-hidden="true">
                                 <path d={item.path} />
                              </svg>
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Colonne Droite : Formulaire */}
            <form className="space-y-4 bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-xs">
               <div>
                  <label htmlFor="name" className="mb-2 text-blue-100 font-medium text-sm inline-block">Nom complet</label>
                  <input type="text" id="name" name="name" placeholder="Ex: Anass Benjelloun"
                     className="px-3 py-2.5 text-sm text-white w-full rounded-xl bg-white/5 border border-white/10 focus:border-orange-400 focus:outline-none placeholder:text-white/30 transition-colors" />
               </div>
               
               <div>
                  <label htmlFor="email" className="mb-2 text-blue-100 font-medium text-sm inline-block">Adresse Email</label>
                  <input type="email" id="email" name="email" placeholder="exemple@domaine.ma"
                     className="px-3 py-2.5 text-sm text-white w-full rounded-xl bg-white/5 border border-white/10 focus:border-orange-400 focus:outline-none placeholder:text-white/30 transition-colors" />
               </div>
               
               <div>
                  <label htmlFor="phone" className="mb-2 text-blue-100 font-medium text-sm inline-block">Téléphone</label>
                  <input type="tel" id="phone" name="phone" placeholder="+212 600-000000"
                     className="px-3 py-2.5 text-sm text-white w-full rounded-xl bg-white/5 border border-white/10 focus:border-orange-400 focus:outline-none placeholder:text-white/30 transition-colors" />
               </div>
               
               <div>
                  <label htmlFor="message" className="mb-2 text-blue-100 font-medium text-sm inline-block">Message</label>
                  <textarea placeholder="Votre message ou question ici..." rows="5" id="message" name="message"
                     className="px-3 py-2.5 text-sm text-white w-full rounded-xl bg-white/5 border border-white/10 focus:border-orange-400 focus:outline-none placeholder:text-white/30 transition-colors"></textarea>
               </div>

               {/* Bouton d'action Ocre marocain */}
               <div className="pt-2">
                  <button type="submit"
                     className="w-full py-3 px-4 text-sm rounded-xl font-bold cursor-pointer text-white bg-[#D97706] hover:bg-[#C2410C] shadow-md shadow-orange-950/20 transition-all focus:outline-none">
                     Envoyer le message
                  </button>
               </div>
            </form>

         </div>
      </section>
   );
}