import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Handshake, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ServiceSwap</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Compte créé avec succès !</CardTitle>
              <CardDescription>Vérifiez votre email pour confirmer votre compte</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Nous avons envoyé un lien de confirmation à votre adresse email. Cliquez sur le lien pour activer votre
                compte et commencer à échanger vos compétences.
              </p>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Aller à la connexion</Link>
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez le support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
