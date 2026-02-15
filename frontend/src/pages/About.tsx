import {
  Crosshair,
  BarChart3,
  Repeat,
  Lightbulb,
  Trophy,
  Users,
  MapPin,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageTransition } from '@/components/PageTransition';

const LOCATIONS = [
  'Langley, BC', 'North Vancouver, BC', 'Costa Mesa, CA',
  'Coapa, CDMX', 'Pedregal, CDMX', 'Denver, CO',
  'Buckhead, GA', 'Johns Creek, GA', 'Loganville, GA', 'Marietta, GA', 'Perimeter, GA', 'West Cobb, GA',
  'Evanston, IL', 'Naperville, IL',
  'Farmington, MI', 'Novi East, MI', 'Wixom, MI',
  'Burnsville, MN', 'St. Louis, MO',
  'Indian Trail, NC',
  'Cincinnati, OH', 'Columbus, OH', 'Eastlake, OH', 'Northfield-Warrensville Heights, OH', 'Richmond-Bedford Heights, OH', 'Rocky River, OH', 'Toledo, OH', 'Westlake, OH',
  'Nashville, TN',
  'Allen, TX', 'Carrollton, TX', 'Keller, TX', 'The Colony, TX',
  'Lynnwood, WA', 'Redmond, WA',
  'Madison, WI',
];

export default function About() {
  return (
    <PageTransition>
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center">
        <Badge variant="default" className="mb-4">
          Official Soccer Training Partner of MLS
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The Next Generation of Soccer Training
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          TOCA Football provides a one-of-a-kind, tech-enhanced soccer experience
          for players of all ages and skill levels.
        </p>
      </div>

      {/* Mission section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Changing the Future of Soccer Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Serving local communities throughout the United States and Canada, our training
            centers welcome players and families to find their best with classes, training
            sessions, and league play that meet players' respective skill-sets.
          </p>
          <p>
            Our soccer classes for ages 1 to 13 are engaging and educational, while
            individual or group training sessions for ages 7 onwards offer progressive
            levels of training for players looking to challenge themselves while also
            having fun. From training sessions and group classes to camps, leagues, and
            more, TOCA offers community soccer experiences you won't find anywhere else.
          </p>
        </CardContent>
      </Card>

      {/* Origin story */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            It All Started with a Tennis Ball and a Garage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            When our founder, Eddie Lewis, was a soccer player at UCLA, he was obsessed
            with getting the most out of his abilities. After learning that the UCLA
            Basketball Team practiced shooting on smaller hoops, he realized he could
            achieve similar benefits by practicing his soccer touch with a smaller ball.
            He began taking reps with a tennis ball against garages to perfect his
            technique. This small-is-harder methodology made him better faster, and it
            was his secret weapon to outpacing the competition.
          </p>
          <p>
            Countless hours and thousands of reps later, he embarked on a career spanning
            from the MLS to the Premier League and two World Cups. At the end of his
            playing days, Eddie realized that he had established a unique set of
            fundamentals that he could pass on to others. That led to the creation of the
            one-of-a-kind training experience and a soccer brand he wished he had growing
            up. Today, what started with a tennis ball has transformed into a world-class
            soccer experience you won't find anywhere else.
          </p>
        </CardContent>
      </Card>

      {/* What we offer — feature cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">What Sets TOCA Apart</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <AboutCard
            icon={<Crosshair className="h-6 w-6 text-primary" />}
            title="Tech-Enhanced Training"
            description="Our proprietary ball-delivery system creates thousands of touch opportunities per session. Each rep is tracked and measured so you can see exactly where you stand and where you're headed."
          />
          <AboutCard
            icon={<Repeat className="h-6 w-6 text-primary" />}
            title="Purposeful Repetition"
            description="Improvement comes from focused practice. TOCA sessions are designed to maximize quality touches in a short time, turning every minute on the pitch into measurable progress."
          />
          <AboutCard
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
            title="Data-Driven Insights"
            description="After every session, you get a detailed breakdown of your performance — score, speed of play, goals, streaks, and more. Track your progress over time and celebrate your improvements."
          />
          <AboutCard
            icon={<Lightbulb className="h-6 w-6 text-primary" />}
            title="Expert Coaching"
            description="Our trainers use real-time data to adjust drills, challenge you at the right level, and keep training fun. It's the combination of human expertise and smart technology that sets TOCA apart."
          />
          <AboutCard
            icon={<Users className="h-6 w-6 text-primary" />}
            title="For All Ages & Levels"
            description="Classes for ages 1–13, individual and group training for ages 7+, adult pickup and leagues, camps, and more — there's something for every player in the family."
          />
          <AboutCard
            icon={<MapPin className="h-6 w-6 text-primary" />}
            title="Community Centered"
            description="With locations across the US and Canada, TOCA serves local communities by bringing world-class training close to home. Find a center near you and start your journey."
          />
        </div>
      </div>

      {/* Ways to play */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ways to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Individual Training',
              'Training Clinics',
              'Classes (Ages 1–13)',
              'Adult Pickup',
              'Adult Leagues',
              'Camps',
              'Group Sessions',
            ].map((way) => (
              <Badge key={way} variant="secondary" className="text-sm">
                {way}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Our Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {LOCATIONS.length} centers across the United States and Canada
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map((loc) => (
              <Badge key={loc} variant="outline" className="text-xs font-normal">
                {loc}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* CTA / portal note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6 text-center">
          <p className="text-lg font-semibold text-primary">
            Train smarter. Track everything. Get better every session.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The TOCA Player Portal is your window into your training journey —
            review past sessions, monitor your stats, and stay on top of your schedule.
          </p>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} TOCA Football
      </p>
    </div>
    </PageTransition>
  );
}

function AboutCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
