using System;
using System.Windows.Forms;
using Acrobat;
using System.Reflection;
using System.IO;

namespace SignPDF
{
	class SignPDF
	{
		[STAThread]
		private static void waitForKey()
		{
			do
			{
				while (!Console.KeyAvailable) { }
			} while (Console.ReadKey(true).Key != ConsoleKey.Enter);
		}


		[STAThread]
		private static string getPassword(string cert)
		{
            var pass = string.Empty;
            ConsoleKey key;
			Console.Write("Password for [{0}]: ", cert);
            do
            {
                var keyInfo = Console.ReadKey(intercept: true);
                key = keyInfo.Key;
                if (key == ConsoleKey.Backspace && pass.Length > 0)
                {
                    Console.Write("\b \b");
                    //pass = pass[0..^1];
                    pass = pass.Remove(pass.Length - 1);
                }
                else if (!char.IsControl(keyInfo.KeyChar))
                {
                    Console.Write("*");
                    pass += keyInfo.KeyChar;
                }
            } while (key != ConsoleKey.Enter);
			Console.WriteLine();

            return pass;
		}


		[STAThread]
		private static void signPDF(string file, string certPath, string pass)
		{
			CAcroPDDoc gpddoc = new AcroPDDocClass();
			object jso;
			if (gpddoc.Open(file))
			{
				jso = gpddoc.GetJSObject();
				object[] param = new object[1];

				param[0] = certPath;
				object con = jso.GetType().InvokeMember("SetUserDigitalIDPath",
				BindingFlags.InvokeMethod, null, jso, param);

				param[0] = pass;
				con = jso.GetType().InvokeMember("SetUserPassword", BindingFlags.InvokeMethod, null, jso, param);

				param[0] = jso;
				con = jso.GetType().InvokeMember("AddSignature", BindingFlags.InvokeMethod, null, jso, param);
			}
		}


		[STAThread]
		static void Main(string[] args)
		{
			CAcroApp gapp = new AcroAppClass();

			// Scan install path for a certificate (.pfx)
            string [] installEntries = Directory.GetFiles(Application.StartupPath);
			bool certFound = false;
			string cert = string.Empty;
			foreach (string entry in installEntries)
			{
				string ext = System.IO.Path.GetExtension(entry);
				if (ext == ".pfx")
				{
					certFound = true;
					cert = entry;
					break;
				}
			}

			if (!certFound)
			{
				Console.WriteLine("[!] No certificate found in install path.");
				Console.Write("Press 'Enter' to exit the application...");
				waitForKey();
				System.Environment.Exit(1);
			}

			var pass = getPassword(System.IO.Path.GetFileName(cert));

            string cwd = Directory.GetCurrentDirectory();
            string [] fileEntries = Directory.GetFiles(cwd);
			foreach (String entry in fileEntries)
			{
				string ext = System.IO.Path.GetExtension(entry);
				if (ext == ".pdf")
				{
                    Console.WriteLine("[pdf] Signing {0}", entry);
					signPDF(entry, cert, pass);
				}
			}

			Console.Write("\nDone. Press 'Enter' to exit the application...");
            waitForKey();
		}

	}
}
