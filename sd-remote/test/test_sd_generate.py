"""Тести CLI для нейронок: python3 -m unittest sd-remote/test/test_sd_generate.py"""
import importlib.util, os, unittest
spec = importlib.util.spec_from_file_location("sdg", os.path.join(os.path.dirname(__file__), "..", "tools", "sd_generate.py"))
sdg = importlib.util.module_from_spec(spec); spec.loader.exec_module(sdg)


def req(*argv):
    return sdg.build_request(sdg.parser().parse_args(["--prompt", "1girl, solo,", "--out", "x.webp", *argv]))


class Cli(unittest.TestCase):
    def test_defaults_match_site(self):
        r = req()
        self.assertEqual(r["prompt"], "<lora:Epistail_0.1:0.6>, <lora:PFT_ASH_0.1:0.5>, 1girl, solo")   # LoRA спочатку, без зайвої коми
        self.assertEqual(r["negative"], sdg.NEG_DEFAULT); self.assertEqual((r["width"], r["height"]), (768, 1344))
        self.assertEqual(r["upscale"], 1.65); self.assertTrue(r["adFace"]); self.assertEqual(r["seed"], -1)

    def test_size_multiples_of_64(self):
        for ratio in sdg.RATIOS:
            for land in (False, True):
                w, h = sdg.size_for(ratio, land, 1216); self.assertTrue(w % 64 == 0 and h % 64 == 0 and max(w, h) == 1216)
        self.assertEqual(sdg.size_for("3:4", False, 1344), (1024, 1344)); self.assertEqual(sdg.size_for("9:16", True, 1344), (1344, 768))

    def test_flags(self):
        r = req("--no-lora", "--no-adetailer", "--upscale", "1", "--ratio", "1:1", "--landscape", "--negative-add", "text")
        self.assertEqual(r["prompt"], "1girl, solo"); self.assertFalse(r["adFace"]); self.assertEqual(r["upscale"], 1); self.assertEqual((r["width"], r["height"]), (1344, 1344))
        self.assertTrue(r["negative"].endswith(", text") and r["negative"].startswith("bad quality"))
        r = req("--lora", "A:0.5", "--lora", "B"); self.assertEqual(r["prompt"], "<lora:A:0.5>, <lora:B:0.8>, 1girl, solo")
        r = req("--width", "700", "--height", "1000"); self.assertEqual((r["width"], r["height"]), (704, 1024))


if __name__ == "__main__":
    unittest.main()
