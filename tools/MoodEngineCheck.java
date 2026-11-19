import com.studyos.app.MoodEngine;
import java.nio.file.*;
import java.util.*;

/** Checks MoodEngine.java against the JS engine. See tools/README_WIDGETS.md for the commands. */
public class MoodEngineCheck {
    public static void main(String[] a) throws Exception {
        int n = 0;
        for (String line : Files.readAllLines(Paths.get(a[0]))) {
            if (line.isBlank()) continue;
            String[] f = line.split("\t");
            MoodEngine.State s = new MoodEngine.State();
            s.now = Long.parseLong(f[0]);
            s.studiedToday = f[1].equals("1");
            s.studiedYesterday = f[2].equals("1");
            s.everStudied = f[3].equals("1");
            s.sessionActive = f[4].equals("1");
            s.lastTaskAt = Long.parseLong(f[5]);
            s.celebrationAt = Long.parseLong(f[6]);
            MoodEngine.Result r = MoodEngine.resolve(s);
            if (!r.mood.equals(f[7]) || r.level != Integer.parseInt(f[8]) || r.nextAt != Long.parseLong(f[9])) {
                System.out.println("MISMATCH line " + (n + 1) + ": java " + r.mood + "/" + r.level + "/" + r.nextAt + " js " + f[7] + "/" + f[8] + "/" + f[9]);
                System.exit(1);
            }
            n++;
        }
        System.out.println("java engine matches js on " + n + " vectors");
    }
}
