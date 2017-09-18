import Benchmark = require('benchmark');


export default function(suiteName: string, testFunction: () => void) {
  const suite = new Benchmark.Suite;
  return new Promise(resolve => {
    // add tests
    suite.add(suiteName, testFunction)
    // add listeners
      .on('cycle', function (event: any) {
        console.log('-', String(event.target));
      })
      .on('complete', function () {
        resolve();
      })
      // run async
      .run({'async': true});
  });
}
