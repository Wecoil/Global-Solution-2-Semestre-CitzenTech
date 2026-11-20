export type Professional = {
  id: string; name: string; photo: string; rating: string; jobs: number;
  price: number; tag: string; distance: string; neighborhood: string;
  description: string; skills: string[]; availability: string[];
};

export const professionals: Professional[] = [
  {
    id: "ana", name: "Ana Paula",
    photo: "https://images.unsplash.com/photo-1704579924216-31ef96f7e008?crop=faces&fit=crop&w=500&h=500&q=85",
    rating: "4,98", jobs: 214, price: 42, tag: "Mais próxima", distance: "8 min",
    neighborhood: "Vila Madalena",
    description: "Cuido de cada casa com atenção aos detalhes e muito respeito pela rotina de quem mora nela. Tenho experiência com famílias, pets e organização de ambientes.",
    skills: ["Limpeza completa", "Passadoria", "Organização"], availability: ["Seg", "Ter", "Qui", "Sex"]
  },
  {
    id: "marcia", name: "Márcia Silva",
    photo: "https://images.unsplash.com/photo-1517945577684-acd9255116a7?crop=faces&fit=crop&w=500&h=500&q=85",
    rating: "4,95", jobs: 186, price: 40, tag: "Melhor avaliação", distance: "12 min",
    neighborhood: "Pinheiros",
    description: "Sou especialista em limpeza cuidadosa e cozinha do dia a dia. Gosto de combinar previamente as prioridades para entregar a casa exatamente como você espera.",
    skills: ["Limpeza completa", "Cozinha", "Limpeza pesada"], availability: ["Ter", "Qua", "Qui", "Sáb"]
  },
  {
    id: "juliana", name: "Juliana Reis",
    photo: "https://images.unsplash.com/photo-1694185766501-487b73d10332?crop=faces&fit=crop&w=500&h=500&q=85",
    rating: "4,91", jobs: 143, price: 38, tag: "Ótimo preço", distance: "18 min",
    neighborhood: "Perdizes",
    description: "Trabalho com serviços domésticos há mais de seis anos. Sou pontual, organizada e tenho carinho especial por passadoria e organização de armários.",
    skills: ["Passadoria", "Organização", "Limpeza leve"], availability: ["Seg", "Qua", "Sex", "Sáb"]
  }
];

export const services = [
  { id: "cleaning", title: "Limpeza", subtitle: "Casa completa", icon: "sparkles", tint: "#DFF4E7" },
  { id: "ironing", title: "Passadoria", subtitle: "Roupas em dia", icon: "shirt", tint: "#FFF0E7" },
  { id: "kitchen", title: "Cozinha", subtitle: "Comida caseira", icon: "chef-hat", tint: "#FFE0CC" },
  { id: "other", title: "Ver todos", subtitle: "Mais tarefas", icon: "grid-2x2", tint: "#EDF8F1" }
] as const;
