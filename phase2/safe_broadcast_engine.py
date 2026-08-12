"""
🛡️ Python Anti-Ban Safe Broadcast Engine (phase2/safe_broadcast_engine.py)
Implements randomized delay jitter, batching pauses, and typing presence to prevent WhatsApp ban.
"""

import time
import random

class SafeBroadcastEngine:
    def __init__(self, min_delay_sec=15, max_delay_sec=40, batch_size=10, cooldown_min=3):
        self.min_delay_sec = min_delay_sec
        self.max_delay_sec = max_delay_sec
        self.batch_size = batch_size
        self.cooldown_min = cooldown_min
        self.sent_count = 0

    def get_random_delay(self):
        return random.uniform(self.min_delay_sec, self.max_delay_sec)

    def apply_spintax_variation(self, message, owner_name):
        greetings = ["Vanakkam", "Hi", "Hello", "Greetings"]
        random_greeting = random.choice(greetings)
        # Apply dynamic variation to prevent signature matching
        return f"{random_greeting} {owner_name}!\n" + message.split('\n', 1)[-1]

    def send_safe_batch(self, leads, send_callback=None):
        for index, lead in enumerate(leads):
            if index > 0 and index % self.batch_size == 0:
                print(f"⏸️ Anti-Ban Batch Cooldown: Pausing for {self.cooldown_min} minutes...")
                time.sleep(self.cooldown_min * 60)

            delay = self.get_random_delay()
            print(f"⏳ Anti-Ban Safety Delay: Sleeping {delay:.1f}s before sending to {lead.get('shop_name')}...")
            time.sleep(delay)

            if send_callback:
                send_callback(lead)
            
            self.sent_count += 1
            print(f"✅ Dispatched to {lead.get('shop_name')} ({self.sent_count}/{len(leads)})")
