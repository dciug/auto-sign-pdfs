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
		private static void signPDF(string file, string certPath)
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

				param[0] = "password";
				con = jso.GetType().InvokeMember("SetUserPassword", BindingFlags.InvokeMethod, null, jso, param);

				param[0] = jso;
				con = jso.GetType().InvokeMember("AddSignature", BindingFlags.InvokeMethod, null, jso, param);
			}
		}

		[STAThread]
		static void Main(string[] args)
		{
			CAcroApp gapp = new AcroAppClass();
			string certPath = Application.StartupPath + "\\MY_TEST_CERTIFICATE.pfx";
            string pp = Path.Combine(Application.StartupPath, Directory.GetCurrentDirectory());

            string [] fileEntries = Directory.GetFiles(pp);
			foreach (String fileEntry in fileEntries)
			{
				string ext = System.IO.Path.GetExtension(fileEntry);
                //Console.WriteLine(ext);
				if (ext == ".pdf")
				{
                    Console.WriteLine("Signing {0}", fileEntry);
					signPDF(fileEntry, certPath);
				}
			}
		}
	}
}
