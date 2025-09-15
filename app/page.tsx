"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Zap, Shield, Star, Search, UserPlus, Handshake, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with improved animations */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ServiceSwap</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Fonctionnalités
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Comment ça marche
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#categories"
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Catégories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" asChild className="hover:scale-105 transition-transform">
              <Link href="/auth/login">Connexion</Link>
            </Button>
            <Button asChild className="hover:scale-105 transition-transform">
              <Link href="/auth/sign-up">Rejoindre</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-b animate-in slide-in-from-top-2">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </Link>
              <Link
                href="#how-it-works"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Comment ça marche
              </Link>
              <Link href="#categories" className="block text-muted-foreground hover:text-foreground transition-colors">
                Catégories
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Rejoindre</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with enhanced animations */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 animate-in fade-in-50 slide-in-from-bottom-3 duration-700">
            Plateforme collaborative
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            Échangez vos{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              compétences
            </span>{" "}
            sans argent
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-200">
            Rejoignez une communauté de créateurs qui échangent leurs services digitaux : design, développement,
            marketing, rédaction et bien plus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in-50 slide-in-from-bottom-6 duration-700 delay-300">
            <Button
              size="lg"
              asChild
              className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href="/auth/sign-up">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="hover:scale-105 transition-all duration-300 bg-transparent"
            >
              <Link href="#how-it-works">Découvrir le concept</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with staggered animations */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi choisir ServiceSwap ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une approche révolutionnaire de l'échange de services entre professionnels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Communauté bienveillante",
                description: "Rejoignez une communauté de créateurs passionnés qui s'entraident",
                delay: "delay-0",
              },
              {
                icon: Zap,
                title: "Échange équitable",
                description: "Système d'échange basé sur la valeur et le temps, pas sur l'argent",
                delay: "delay-100",
              },
              {
                icon: Shield,
                title: "Sécurisé et fiable",
                description: "Système de notation et de vérification pour des échanges en toute confiance",
                delay: "delay-200",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${feature.delay}`}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works with enhanced visuals */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour commencer à échanger vos compétences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary via-primary to-primary opacity-20"></div>

            {[
              {
                icon: UserPlus,
                title: "1. Créez votre profil",
                description:
                  "Présentez vos compétences et ce que vous recherchez. Plus votre profil est détaillé, mieux vous serez mis en relation.",
                delay: "delay-0",
              },
              {
                icon: Search,
                title: "2. Trouvez des partenaires",
                description:
                  "Parcourez les services disponibles ou publiez vos besoins. Notre algorithme vous suggère les meilleurs matches.",
                delay: "delay-200",
              },
              {
                icon: Handshake,
                title: "3. Échangez et collaborez",
                description:
                  "Définissez les termes de l'échange, collaborez sur vos projets et laissez des avis pour renforcer la communauté.",
                delay: "delay-400",
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`text-center group animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${step.delay}`}
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with hover effects */}
      <section id="categories" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Catégories populaires</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les services les plus échangés sur notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Design", count: "150+ services", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
              {
                name: "Développement",
                count: "200+ services",
                color: "bg-green-500",
                gradient: "from-green-500 to-green-600",
              },
              {
                name: "Marketing",
                count: "120+ services",
                color: "bg-purple-500",
                gradient: "from-purple-500 to-purple-600",
              },
              {
                name: "Rédaction",
                count: "80+ services",
                color: "bg-orange-500",
                gradient: "from-orange-500 to-orange-600",
              },
              { name: "SEO", count: "90+ services", color: "bg-red-500", gradient: "from-red-500 to-red-600" },
              { name: "Vidéo", count: "60+ services", color: "bg-pink-500", gradient: "from-pink-500 to-pink-600" },
              {
                name: "Photo",
                count: "70+ services",
                color: "bg-indigo-500",
                gradient: "from-indigo-500 to-indigo-600",
              },
              {
                name: "Consulting",
                count: "40+ services",
                color: "bg-teal-500",
                gradient: "from-teal-500 to-teal-600",
              },
            ].map((category, index) => (
              <Card
                key={category.name}
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-3 duration-700`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <span className="text-white font-bold text-lg">{category.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce que disent nos membres</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                role: "Designer UI/UX",
                content:
                  "J'ai pu échanger mes compétences en design contre du développement web. Une expérience fantastique !",
                rating: 5,
                avatar: "MD",
              },
              {
                name: "Thomas Martin",
                role: "Développeur Full-Stack",
                content:
                  "La communauté est incroyable. J'ai appris énormément en échangeant avec d'autres professionnels.",
                rating: 5,
                avatar: "TM",
              },
              {
                name: "Sophie Laurent",
                role: "Consultante Marketing",
                content: "Enfin une plateforme qui valorise l'échange plutôt que l'argent. Je recommande vivement !",
                rating: 5,
                avatar: "SL",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-4 duration-700`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-20 left-20 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-1500"></div>
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            Prêt à rejoindre la révolution ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-100">
            Rejoignez des milliers de créateurs qui échangent déjà leurs compétences et développent leur réseau
            professionnel.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-in fade-in-50 slide-in-from-bottom-6 duration-700 delay-200"
          >
            <Link href="/auth/sign-up">
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ServiceSwap</span>
              </div>
              <p className="text-muted-foreground">
                La plateforme collaborative pour échanger vos compétences digitales.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plateforme</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Communauté</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Événements
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ServiceSwap. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
