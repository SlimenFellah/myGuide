from django.core.management.base import BaseCommand
from subscriptions.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        # Create Free Plan
        free_plan, created = SubscriptionPlan.objects.get_or_create(
            name='free',
            defaults={
                'price': 0.00,
                'duration_days': 0,  # Unlimited
                'features': {
                    'trip_plans_per_month': 3,
                    'chatbot_messages_per_day': 10,
                    'api_calls_per_day': 50,
                    'export_trips': False,
                    'priority_support': False,
                    'advanced_ai_features': False
                },
                'is_active': True
            }
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created Free plan: ${free_plan.price}')
            )
        else:
            self.stdout.write(f'Free plan already exists: ${free_plan.price}')

        # Create Monthly Premium Plan
        monthly_plan, created = SubscriptionPlan.objects.get_or_create(
            name='monthly',
            defaults={
                'price': 1.00,
                'duration_days': 30,
                'features': {
                    'trip_plans_per_month': 'unlimited',
                    'chatbot_messages_per_day': 'unlimited',
                    'api_calls_per_day': 'unlimited',
                    'export_trips': True,
                    'priority_support': True,
                    'advanced_ai_features': True,
                    'custom_trip_templates': True,
                    'detailed_analytics': True
                },
                'is_active': True
            }
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created Monthly Premium plan: ${monthly_plan.price}')
            )
        else:
            self.stdout.write(f'Monthly Premium plan already exists: ${monthly_plan.price}')

        # Create Annual Premium Plan (15% discount)
        annual_plan, created = SubscriptionPlan.objects.get_or_create(
            name='annual',
            defaults={
                'price': 10.00,  # $12 - 15% = $10.20, rounded to $10
                'duration_days': 365,
                'features': {
                    'trip_plans_per_month': 'unlimited',
                    'chatbot_messages_per_day': 'unlimited',
                    'api_calls_per_day': 'unlimited',
                    'export_trips': True,
                    'priority_support': True,
                    'advanced_ai_features': True,
                    'custom_trip_templates': True,
                    'detailed_analytics': True,
                    'annual_discount': '15%'
                },
                'is_active': True
            }
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created Annual Premium plan: ${annual_plan.price}')
            )
        else:
            self.stdout.write(f'Annual Premium plan already exists: ${annual_plan.price}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created/verified all subscription plans!')
        )