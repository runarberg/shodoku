<script setup lang="ts">
import { deckBrowserRoute, reviewRoute } from "../router";
</script>

<template>
  <article class="about-view">
    <h2>About Shodoku</h2>

    <p>
      Shoduku is an app to help you study Kanji. The primary goal is to provide
      as much context as possible as you practice writing and reading each
      kanji. Instead of just the meanings and the readings of each character, we
      provide you with the whole dictionary to help you remember.
    </p>

    <section id="section:usage">
      <h3>How to use</h3>

      <p>
        Start by
        <RouterLink :to="deckBrowserRoute">selecting a deck</RouterLink> to
        study. This will put all the kanji in that deck in your review queue, in
        the same order as they appear in the deck. You can have several decks.
      </p>

      <p>
        After you have selected a deck you can
        <RouterLink :to="reviewRoute">start reviewing</RouterLink>. We start by
        teaching you how to write the kanji. If you don’t know the stroke order,
        you can click the hint button next to the drawing pad to see the next
        stroke. When you are done the correct strokes will appear under your
        drawing. Click the play button to compare your stoke orders.
      </p>

      <p>
        As you practice writing you can scroll down to see all the words and
        example sentences that contains this kanji. The kanji it self will be
        hidden but the readings will appear as furigana above it. This may help
        you remembering the kanji.
      </p>

      <p>
        When you are ready you can click <em>Show Writing</em>. This will reveal
        the kanji, the strokes, and the components it is comprised of. It is
        recommended that you study these components and create stories that
        relate to the meaning of the kanji which will help you remember it. When
        you review this character this may make it easier for you to remember
        how to draw it.
      </p>

      <p>
        When you are ready to move on to the next character select one of the
        four options to rate its difficulty. This rating will affect how long of
        a time will pass until you review this character. Repeat this process
        until you have no characters left in your review queue.
      </p>

      <p>
        The next day your review queue will fill up again. This time you may be
        asked to review not just <em>writing</em>, but also <em>reading</em> the
        character. In reading practice, try to remember the meaning of the
        character. You can also scroll down to see the character used in real
        words. The furigana for that character will be hidden, try to remember
        how to read some of these words. Finally reveal the answer and rate the
        difficulty same as you did with your writing practice previously.
      </p>
    </section>

    <section id="section:data-sources">
      <h3>Data Sources</h3>

      <ul>
        <li>
          Kanji strokes and radical/component info are from
          <a href="https://kanjivg.tagaini.net/" target="_blank">KanjiVG</a>.
          This includes mappings between components and kanji, e.g. used in the
          component picker.
        </li>

        <li>
          Kanji meaning, readings, and frequency data comes from
          <a
            href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
            target="_blank"
            >KANJIDIC Project</a
          >.
        </li>

        <li>
          Vocabulary words, readings, and glosses come from
          <a
            href="http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project"
            target="_blank"
            >JMdict-EDICT Dictionary Project</a
          >.
        </li>

        <li>
          Example sentences and translations come from
          <a href="https://tatoeba.org" target="_blank">Tatoeba</a>.
        </li>

        <li>
          JLPT data comes from
          <a href="http://www.tanos.co.uk/jlpt/" target="_blank"
            >JLPT Resources</a
          >
          by <span class="author">Jonathan Waller</span>. This is used for both
          the JLPT kanji deck as well as for ordering of vocabulary words.
        </li>
      </ul>
    </section>

    <section id="section:development">
      <h3>Development</h3>

      <p>
        This project is open sourced and hosted on GitHub under an
        <a
          href="https://github.com/runarberg/shodoku/blob/main/LICENSE.txt"
          target="_blank"
          >MIT License</a
        >:
      </p>

      <ul>
        <li>
          <a href="https://github.com/runarberg/shodoku" target="_blank"
            >View source code</a
          >
        </li>

        <li>
          <a href="https://github.com/runarberg/shodoku/issues" target="_blank"
            >File an issue</a
          >
        </li>

        <li>
          <a href="https://github.com/runarberg/shodoku/pulls" target="_blank"
            >Contribute</a
          >
        </li>
      </ul>
    </section>

    <section id="section:donations">
      <h3>Donations</h3>

      <p>
        This app is only possible because of free and open data (see
        <a href="#section:data-sources">data sources</a> above). Consider
        donating to any of these instead, as they have put far more work into
        this than I have.
      </p>

      <p>
        If you insist on paying for this app, consider
        <a
          href="https://getinvolved.unrwausa.org/fundraiser/6003750"
          target="_blank"
          >donating to UNWRA</a
        >
        instead.
        <strong class="free-palestine">Free Palestine 🇵🇸</strong>.
      </p>
    </section>
  </article>
</template>

<style scoped>
.about-view a {
  color: var(--accent-color);
  font-weight: 600;
  text-decoration: none;
}
</style>
