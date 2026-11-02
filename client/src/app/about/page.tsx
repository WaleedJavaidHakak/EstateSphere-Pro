
import React from 'react';
import { Building2, Users, Trophy, Target } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Happy Clients', value: '10K+', icon: Users },
    { label: 'Property Listings', value: '30+', icon: Building2 },
    { label: 'Awards Won', value: '15+', icon: Trophy },
    { label: 'Years Experience', value: '10+', icon: Target },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-primary">RealEstate Pro</span>
          </h1>

          <p className="text-lg text-muted-foreground">
            We are an Indian 	Walestate platform dedicated to helping
            you discover your dream home, find the right property investment,
            and connect with property professionals across India.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="bg-card border border-border p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-3xl font-bold mb-2">
                  {stat.value}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              Our Mission
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              At RealEstate Pro, our mission is to simplify the property
              journey across India. Whether you are buying your first home,
              searching for a rental apartment, selling a property, or
              exploring commercial 	Walestate, we provide a platform
              to discover properties and connect with agents.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              We believe in transparency, accessibility, and putting
              users first. Our platform connects buyers with sellers
              and tenants with landlords through a convenient
              property discovery experience.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              From Bengaluru and Mumbai to New Delhi, Hyderabad,
              Pune, Chennai and Srinagar, we aim to make property
              discovery easier across Indian cities.
            </p>
          </div>

          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80"
              alt="Modern residential property in India"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
