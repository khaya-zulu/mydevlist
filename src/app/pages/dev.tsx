export const Dev = () => {
  return (
    <div>
      <div className="p-10 bg-neutral-50 border-b border-neutral-200 pb-40">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Meet Khaya Zulu</h1>
          <p>
            Khaya is a software engineer at Google. He is known for his work on
            the Chrome browser and the Google Assistant.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto -translate-y-32">
        <img src="/example.png" alt="Khaya Zulu" className="w-full h-auto" />

        <div className="py-4 border-b-2 border-purple-700 mb-8 mt-2">
          <div>May 28, 2026</div>
        </div>

        <div className="flex gap-4">
          <div className="flex-2">
            Sometimes the best ideas come to you while you’re out with friends,
            floating in the pool, or setting up that beach picnic—lightning
            hits, and you realize you have the perfect solve for that pesky bug
            that’s been keeping you up at night. We’ve been there too.
            <br />
            That’s what inspired us to create the new ESC collection. It’s not a
            manifesto to put down tools and chill at the beach (though that
            sounds nice too), it’s the recognition that occasionally we have to
            escape the confines of a desk for the problem-solving to begin.
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div>Social Media</div>
              <hr className="mt-4 border-neutral-200 border" />
            </div>
            <div>
              <div>Links Crawled</div>
              <hr className="mt-4 border-neutral-200 border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
