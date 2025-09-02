import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, Users, MessageCircle, Shield, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'Safe Space',
      description: 'A supportive environment where you can be yourself without fear of judgment or discrimination.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with like-minded individuals who understand your experiences and challenges.'
    },
    {
      icon: MessageCircle,
      title: 'Open Discussion',
      description: 'Share your thoughts, ask questions, and get advice from the community.'
    },
    {
      icon: Heart,
      title: 'Support',
      description: 'Find emotional support and encouragement during difficult times.'
    }
  ]

  const stats = [
    { label: 'Community Members', value: '1,000+' },
    { label: 'Supportive Posts', value: '5,000+' },
    { label: 'Helpful Replies', value: '15,000+' },
    { label: 'Daily Active Users', value: '200+' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                PinkAnt
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A supportive online community where LGBTQ+ people can connect, share experiences, 
              and support one another against isolation and mockery.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/forum"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
                >
                  Join the Discussion
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/profile"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  View Profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="btn-primary text-lg px-8 py-4"
                >
                  Join the Community
                </Link>
                <Link
                  to="/forum"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Browse Forum
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose PinkAnt?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to creating a safe, inclusive space where everyone feels welcome and supported.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="card bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Connect?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of people who have found support, friendship, and understanding in our community.
          </p>
          {user ? (
            <Link
              to="/forum"
              className="inline-flex items-center gap-2 bg-white text-pink-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Posting
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-white text-pink-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PA</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              PinkAnt
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            A supportive community for everyone
          </p>
          <div className="text-sm text-gray-500">
            © 2024 PinkAnt. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
