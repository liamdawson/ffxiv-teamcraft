import {SteadyHandII} from './model/actions/buff/steady-hand-ii';
import {BasicTouch} from './model/actions/quality/basic-touch';
import {Simulation} from './simulation/simulation';
import {Craft} from '../../model/garland-tools/craft';
import {CrafterStats} from './model/crafter-stats';
import {BasicSynthesis} from './model/actions/progression/basic-synthesis';
import {SteadyHand} from './model/actions/buff/steady-hand';
import {InnerQuiet} from './model/actions/buff/inner-quiet';
import {Buff} from './model/buff.enum';
import {Manipulation} from './model/actions/buff/manipulation';
import {ManipulationII} from './model/actions/buff/manipulation-ii';
import {WasteNot} from './model/actions/buff/waste-not';
import {WasteNotII} from './model/actions/buff/waste-not-ii';
import {Ingenuity} from './model/actions/buff/ingenuity';
import {IngenuityII} from './model/actions/buff/ingenuity-ii';
import {InitialPreparations} from './model/actions/buff/initial-preparations';
import {MakersMark} from './model/actions/buff/makers-mark';
import {FlawlessSynthesis} from './model/actions/progression/flawless-synthesis';
import {Observe} from './model/actions/other/observe';
import {FocusedSynthesis} from './model/actions/progression/focused-synthesis';
import {HastyTouch} from './model/actions/quality/hasty-touch';
import {RapidSynthesisII} from './model/actions/progression/rapid-synthesis-ii';

const infusionOfMind_Recipe: Craft = {
    'id': '3595',
    'job': 14,
    'rlvl': 288,
    'durability': 80,
    'quality': 12913,
    'progress': 2854,
    'lvl': 69,
    'yield': 3,
    'hq': 1,
    'quickSynth': 1,
    'ingredients': [
        {
            'id': 19872,
            'amount': 1,
            'quality': 1244
        },
        {
            'id': 19907,
            'amount': 1,
            'quality': 1313
        },
        {
            'id': 19915,
            'amount': 2,
            'quality': 1313
        },
        {
            'id': 20013,
            'amount': 1,
            'quality': 1272
        },
        {
            'id': 19,
            'amount': 2
        },
        {
            'id': 18,
            'amount': 1
        }
    ],
    'complexity': {
        'nq': 155,
        'hq': 160
    }
};

const alc_70_350_stats: CrafterStats = new CrafterStats(
    14,
    1467,
    1468,
    474,
    true,
    70);

describe('Craft simulator tests', () => {

    describe('Base tests', () => {
        it('should be able to predict correct progression on action', () => {
            const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHand(), new BasicSynthesis()], alc_70_350_stats);
            simulation.run();
            expect(simulation.progression).toBeCloseTo(352, 1);
        });

        it('should be able to predict correct quality increase on action', () => {
            const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHandII(), new BasicTouch()], alc_70_350_stats);
            simulation.run();
            expect(simulation.quality).toBeCloseTo(569, 1);
        });

        it('should apply stroke of genius on specialist craft start', () => {
            const simulation = new Simulation(infusionOfMind_Recipe, [new BasicTouch()], alc_70_350_stats);
            simulation.run();
            expect(simulation.availableCP).toBe(489);
            expect(simulation.maxCP).toBe(489);
        });

        it('should remove CP properly on action', () => {
            const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHand(), new BasicSynthesis()], alc_70_350_stats);
            simulation.run();
            expect(simulation.availableCP).toBe(467);
        });

        it('should take Observe combo into account', () => {
            const results = [];
            // Run simulation 10k times, to be sure with probability
            for (let i = 0; i < 10000; i++) {
                const simulation = new Simulation(infusionOfMind_Recipe, [new Observe(), new FocusedSynthesis()], alc_70_350_stats);
                simulation.run();
                results.push(simulation.steps[0].success);
            }
            expect(results.filter(row => !row).length).toBe(0);
        });
    });

    describe('Buffs tests', () => {

        describe('Steady Hands', () => {
            it('should be able to apply steady hand buff properly', () => {
                const results = [];
                // Run simulation 10k times, to be sure with probability
                for (let i = 0; i < 10000; i++) {
                    const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHand(), new BasicSynthesis()], alc_70_350_stats);
                    simulation.run();
                    results.push(simulation.steps[1].success);
                }
                // Expect no failures, as steady hand ensures 100% success with a 90% skill.
                expect(results.filter(res => !res).length).toBe(0);
            });

            it('should be able to apply steady hand II buff properly', () => {
                const results = [];
                // Run simulation 10k times, to be sure with probability
                for (let i = 0; i < 10000; i++) {
                    const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHandII(), new BasicTouch()], alc_70_350_stats);
                    simulation.run();
                    results.push(simulation.steps[1].success);
                }
                // Expect no failures, as steady hand ensures 100% success with a 90% skill.
                expect(results.filter(res => !res).length).toBe(0);
            });
        });

        describe('Inner Quiet', () => {
            it('should increase Inner Quiet stacks on quality addition', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new InnerQuiet(), new SteadyHandII(), new BasicTouch()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.getBuff(Buff.INNER_QUIET).stacks).toBe(2);
            });

            it('should affect quality increase properly', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new InnerQuiet(), new SteadyHandII(), new BasicTouch(), new BasicTouch()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.quality).toBeCloseTo(1262, 1);
            });
        });

        describe('Manipulations', () => {
            it('should repair properly with Manupilation', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new Manipulation(), new BasicSynthesis(), new BasicSynthesis(), new BasicSynthesis(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.solidity).toBe(70);
            });

            it('should repair properly with Manupilation II', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new ManipulationII(), new BasicSynthesis(), new BasicSynthesis(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.solidity).toBe(65);
            });
        });

        describe('Waste nots', () => {
            it('should take waste not into account', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new WasteNot(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.solidity).toBe(75);
            });

            it('should take waste not II into account', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new WasteNotII(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.solidity).toBe(75);
            });
        });

        describe('Ingenuities', () => {
            it('should properly reduce recipe level with Ingenuity, influencing progression', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new SteadyHand(), new Ingenuity(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.progression).toBe(452);
            });

            it('should properly reduce recipe level with Ingenuity II, influencing progression', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new SteadyHand(), new IngenuityII(), new BasicSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.progression).toBe(458);
            });
        });

        describe('Initial preparations', () => {
            it('should apply initial preparations and reduce cost on proc', () => {
                const results = [];
                for (let i = 0; i < 10000; i++) {
                    const simulation = new Simulation(infusionOfMind_Recipe,
                        [new InitialPreparations(), new IngenuityII()],
                        alc_70_350_stats);
                    simulation.run();
                    results.push(simulation.steps[1].cpDifference === 22);
                }
                // Expect around 2k procs with a precision of +/- 100
                expect(results.filter(res => res).length).toBeGreaterThan(1900);
                expect(results.filter(res => res).length).toBeLessThan(2100);
            });
        });

        describe('Maker\'s Mark', () => {
            it('should compute correct stacks amount', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new MakersMark()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.getBuff(Buff.MAKERS_MARK).duration).toBe(29);
            });

            it('should affect Flawless Synthesis as it has to', () => {
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new MakersMark(), new SteadyHand(), new FlawlessSynthesis()],
                    alc_70_350_stats);
                simulation.run();
                expect(simulation.getBuff(Buff.MAKERS_MARK).duration).toBe(27);
                expect(simulation.progression).toBe(40);
                expect(simulation.availableCP).toBe(447);
                expect(simulation.solidity).toBe(80);
            });
        });
    });

    describe('Other tests', () => {

        it('should have a good probability system', () => {
            const results = [];
            // Run simulation 100k times, to be sure with probability
            for (let i = 0; i < 100000; i++) {
                // Basic Synthesis has 90% success rate
                const simulation = new Simulation(infusionOfMind_Recipe, [new BasicSynthesis()], alc_70_350_stats);
                simulation.run();
                results.push(simulation.steps[0].success);
            }
            // Expect around 10k failure, with a precision of +/-400.
            expect(results.filter(res => !res).length).toBeGreaterThan(9600);
            expect(results.filter(res => !res).length).toBeLessThan(10400);
        });

        it('should be able to run in linear mode properly', () => {
            const results = [];
            // Run simulation 10k times, to be sure with probability
            for (let i = 0; i < 10000; i++) {
                // Hasty Touch has 50% probability, with linear mode this should never fail.
                const simulation = new Simulation(infusionOfMind_Recipe,
                    [new HastyTouch(), new HastyTouch(), new HastyTouch()], alc_70_350_stats);
                simulation.run(true);
                results.push(...simulation.steps.map(step => step.success));
            }
            // Expect no failure at all
            expect(results.filter(res => !res).length).toBe(0);
        });

        it('should be able to provide proper reliability report', () => {
            const simulation = new Simulation(infusionOfMind_Recipe,
                [new RapidSynthesisII(), new RapidSynthesisII(), new RapidSynthesisII()], alc_70_350_stats);
            const report = simulation.getReliabilityReport();
            expect(report.successPercent).toBeGreaterThan(15);
            expect(report.successPercent).toBeLessThan(25);
        });
    });
});
